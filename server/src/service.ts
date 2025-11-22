import File from "./db/file";
import Course from "./db/course";
import Timer from "./db/timer";
import UserStats from "./db/userstats";
import DBflashcard from "./db/flashcards";
import { Schema, Types } from "mongoose";
import Flashcard from "./flashcard";
import { callLLMApi } from "./llmservice";

export async function checkFilesInDB(filenames: string[]): Promise<Map<string, boolean>>  {
    const results = await File.find({ filename: { $in: filenames } });
    const fileSet = new Set(results?.map(file => file.filename));
    console.log("files array size: " + filenames.length);
    return new Map(filenames.map(name => [name, fileSet.has(name)]));
}

export async function getFlashcardsByCourseIds(courseIds: string, userId: string): Promise<Flashcard[]> {
    const currentTime = new Date().getTime();

    // Ensure it's a string and sanitize
    const sanitizedCourseIds = String(courseIds).trim();

    // Validate ObjectId format BEFORE creating ObjectId
    if (!Types.ObjectId.isValid(sanitizedCourseIds)) {
        console.error(`Invalid ObjectId format: "${sanitizedCourseIds}"`);
        throw new Error(`Invalid course ID format: ${sanitizedCourseIds}`);
    }

    const id = new Types.ObjectId(sanitizedCourseIds);
    let files = await File.find({ courseId: id }).lean();
    console.log(`Found ${files.length} files for course: ${id}`);

    let results: Flashcard[] = [];

        for (const file of files) {
            const fileCards = await DBflashcard.find({ fileId: file._id }).lean();
            results = results.concat(fileCards);
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

async function getCourseIdByUrl(courseUrl: string): Promise<Schema.Types.ObjectId> {
    const course = await Course.findOne({ url: courseUrl }).lean();
    if (!course) {
        console.log("course not found, inserting course with url: ", courseUrl);
        const newCourse = new Course({ url: courseUrl });
        await newCourse.save();
        return newCourse._id;
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

export async function getUserStats(userId: string): Promise<{number, number} | null> {
    const stats = await UserStats.findOne({ userId: userId });
    return stats ? { streak: stats.streak, lastStudied: stats.lastStudied } : null;
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
                userId: userId,
                streak: 1,
                lastStudied: new Date().getTime(),
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

export async function createCards(file: string, url: string, fileName: string, fileUrl: string): Promise<any> {

    const courseId = await getCourseIdByUrl(url);
    
    // check courseId type
    console.log("courseId type: " + typeof courseId);

    // insert new file into DB
    const dbfile = new File({
        filename : fileName,
        courseId: courseId,
    });
    await dbfile.save();

    // create flashcards with LLM
    const cards = await processFiles(file, dbfile._id);

    const result = { fileId: dbfile._id, filename: fileName, courseId: courseId, cards: cards };

    console.log("Created flashcards:", result);


    return result;
}

async function processFiles(file: string, fileId: Types.ObjectId): Promise<any> {

    const cards = [];
    let llmResult;
    
        try {
            
            // Call LLM API to process the PDF
            llmResult = await callLLMApi({
                content: file,
                contentType: 'application/pdf'
            });

            for (const card of llmResult) {
                const flashcard = new DBflashcard({
                    fileId: fileId,
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
    
    
    return cards;
}

