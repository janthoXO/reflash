import File from "./db/file";
import Course from "./db/course";
import Timer from "./db/timer";
import DBflashcard from "./db/flashcards";
import { Schema } from "mongoose";
import Flashcard from "./flashcard";
import { callLLMApi } from "./llmservice";

export async function checkFilesInDB(filenames: string[]): Promise<Map<string, boolean>>  {
    const results = await File.find({ filename: { $in: filenames } });
    const fileSet = new Set(results?.map(file => file.filename));
    console.log("files array size: " + filenames.length);
    return new Map(filenames.map(name => [name, fileSet.has(name)]));
}

export async function getFlashcardsByCourseId(courseIds: string, userId: string): Promise<Flashcard[]> {
    const currentTime = new Date().getTime();
    let results = await DBflashcard.find({ courseId: { $in: courseIds } });
    results = results.filter(async (card) => {
        const timer = await Timer.findOne({ userId: userId, flashcardId: card._id });
        return (timer && timer.time < currentTime);
    });

    return results;
}

async function getCourseIdByUrl(courseUrl: string): Promise<Schema.Types.ObjectId> {
    const course = await Course.findOne({ url: courseUrl }).lean();
    if (!course) {
        console.log("courseUrl: ", courseUrl);
        throw new Error(`Course with URL ${courseUrl} not found`);
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

export async function updateCard(userId: string, cardId: string, solved: boolean): Promise<string> {

    if (solved) {
        // If solved, update timer to 24h from now
        const twentyFourHoursLater = new Date().getTime() + 24 * 60 * 60 * 1000;
        await Timer.findOneAndUpdate
            ({ userId: userId, flashcardId: cardId },
             { time: twentyFourHoursLater },
             { upsert: true, new: true }
        );
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

interface FileData {
    filename: string;
    buffer: Buffer;
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

