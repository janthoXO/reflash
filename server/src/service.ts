import File from "./db/file";
import Course from "./db/course";
import Timer from "./db/timer";
import UserStats from "./db/userstats";
import DBflashcard from "./db/flashcards";
import { Schema, Types } from "mongoose";
import Flashcard from "./flashcard";
import { callLLMApi } from "./llmservice";

export async function checkFilesInDB(fileUrls: string[]): Promise<Map<string, boolean>>  {
    const results = await File.find({ fileUrl: { $in: fileUrls } });
    const fileSet = new Set(results?.map(file => file.fileUrl));
    return new Map(fileUrls.map(name => [name, fileSet.has(name)]));
}

export async function getFlashcardsByCourseIds(courseUrl: string, userId: string): Promise<any> {
    const currentTime = new Date().getTime();


    const id = await getCourseIdByUrl(courseUrl);
    let files = await File.find({ courseId: id }).lean();
    console.log(`Found ${files.length} files for course: ${id}`);

    let results = [];

        for (const file of files) {
            const fileCards = await DBflashcard.find({ fileId: file._id }).lean();
            results.push({...file, cards: fileCards});
        }


    console.log(`Found ${results.length} flashcards for courses: ${id}`);
    
    // Fix the async filter - need to properly handle Promise.all
    const filteredResults = [];
    for (const card of results) {
        const timer = await Timer.findOne({ userId: userId, flashcardId: card._id });
        if (!timer || timer.time < currentTime) {
            filteredResults.push(card);
        }
    }

    console.log(`Filtered to ${filteredResults.length} due flashcards for user: ${userId}`);

    return filteredResults;
}

async function getCourseIdByUrl(courseUrl: string): Promise<Schema.Types.ObjectId | null> {
    const course = await Course.findOne({ url: courseUrl }).lean();
    if (!course) {
        console.log("course not found, inserting course with url: ", courseUrl);
        return null;
    }
    return course._id;
}

async function getFileIdByNameAndCourseId(filename: string, courseId: string): Promise<string | null> {
    const file = await File.findOne({ filename: filename, courseId: courseId });
    return file ? file._id.toString() : null;
}

export async function getTimer(userId: string, cardId: string): Promise<number | null> {
    const timer = await Timer.findOne({ userId: userId, flashcardId: cardId });
    return timer ? timer.time : null;
}

export async function getUserStats(userId: string): Promise<any> {
    // find user stats and populate courses or create new if not exist
    const stats = await UserStats.findOne({ userId: userId }).populate('courses');
    if (!stats) {
        const newUserStats = new UserStats({
            userId: userId,
            streak: 0,
            lastStudied: 0,
            courses: []
        });
        await newUserStats.save();
        return newUserStats;
    }

    return stats;
}

export async function associateCourseWithUser(courseUrl: string, userId: string): Promise<void> {

    // Validate userId is provided
    if (!userId) {
        console.error("userId is required but not provided");
        throw new Error("userId is required");
    }

    const courseId = await getCourseIdByUrl(courseUrl);

    if (!courseId) {
        console.log("Course does not yet exist, skip");
        return;
    }

    const userStats = await UserStats.findOne({ userId: userId });

    if (!userStats) {
        const newUserStats = new UserStats({
            userId: userId,
            streak: 0,
            lastStudied: new Date().getTime(),
            courses: [courseId],
        });
        await newUserStats.save();
        return;
    }
    if (userStats.courses.includes(courseId)) {
        return;
    }
    userStats.courses.push(courseId);
    await userStats.save();
}

export async function updateCard(userId: string, cardId: string, solved: boolean): Promise<string> {

    if (solved) {
        // If solved, update timer to 24h from now
        const twentyFourHoursLater = new Date().getTime() + 24 * 60 * 60 * 1000;
        await Timer.findOneAndUpdate
            ({ userId: userId, flashcardId: cardId },
             { time: twentyFourHoursLater },
             { upsert: true, new: true }
        );

        // check for user stats and update streak
        const userStats = await UserStats.findOne({ userId: userId });
        if (userStats) {
            const lastStudiedDate = new Date(userStats.lastStudied);
            const now = new Date();
            const diffTime = now.getTime() - lastStudiedDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                userStats.streak += 1;
                userStats.lastStudied = now.getTime();
                await userStats.save();
            } else if (diffDays > 1) {
                userStats.streak = 1;
                userStats.lastStudied = now.getTime();
                await userStats.save();
            }
        } else {
            const newUserStats = new UserStats({
                userId: userId,  // This was missing in the original code
                streak: 1,
                lastStudied: new Date().getTime(),
                courses: []  // Initialize empty courses array
            });
            await newUserStats.save();  
        }

        // log the updated time as date and time
        return `Timer updated to ${new Date(twentyFourHoursLater).toLocaleString()}`;
    } else {
        // If not solved, update timer to 5 minutes from now
        const fiveMinutesLater = new Date().getTime() + 5 * 60 * 1000;
        await Timer.findOneAndUpdate(
            { userId: userId, flashcardId: cardId },
            { time: fiveMinutesLater },
            { upsert: true, new: true }
        );
        return `Timer updated to ${new Date(fiveMinutesLater).toLocaleString()}`;
    }
}

export async function createCards(file: string, url: string, fileName: string, fileUrl: string, userId: string): Promise<any> {


    // Validate userId is provided
    if (!userId) {
        console.error("userId is required but not provided");
        throw new Error("userId is required");
    } else {
        console.log("createCards called with userId: ", userId);
    }

    const cards = [];
    let llmResult;
    let courseId;
    let dbfileId;
    let courseName;
    
        try {
            
            // Call LLM API to process the PDF
            llmResult = await callLLMApi({
                content: file,
                contentType: 'application/pdf'
            });

            console.log(`LLM returned ${llmResult.cards.length} flashcards for course: ${llmResult.courseName}`);

            courseName = llmResult.courseName;
            courseId = await getCourseIdByUrl(url);
            if (!courseId) {
                const course = new Course({
                    url: url,
                    name: courseName
                });
                await course.save();
                courseId = course._id;
            }

            associateCourseWithUser(url, userId);

            // Check if file already exists
            let dbfile = await File.findOne({ fileUrl: fileUrl });
            if (!dbfile) {
                // insert new file into DB only if it doesn't exist
                dbfile = new File({
                    filename : fileName,
                    courseId: courseId,
                    fileUrl: fileUrl
                });
                await dbfile.save();
                console.log(`Created new file: ${fileName}`);
            } else {
                console.log(`File already exists: ${fileName}`);
            }
            dbfileId = dbfile._id.toString();

            for (const card of llmResult.cards) {
                const flashcard = new DBflashcard({
                    fileId: dbfile._id,
                    question: card.question,
                    answer: card.answer,
                });
                await flashcard.save();
                cards.push(flashcard);
            }
            
        } catch (error) {
            console.error(`Error processing file: `, error);
            return Promise.reject(error);
        }


    const result = { fileId: dbfileId, filename: fileName, courseId: courseId, courseName: courseName, cards: cards };

    console.log("Created flashcards.");

    return result;
}

