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

export async function getFlashcardsByCourseIds(courseIds: string[]): Promise<Flashcard[]> {
    const results = await DBflashcard.find({ courseId: { $in: courseIds } });
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

export async function createCards(files: FileData[], url: string, fileName: string): Promise<any> {

    const courseId = await getCourseIdByUrl(url);
    
    // check courseId type
    console.log("courseId type: " + typeof courseId);

    // insert new file into DB
    const file = new File({
        filename : fileName,
        courseId: courseId,
    });
    await file.save();

    // create flashcards with LLM
    const cards = await processFiles(files, file._id);

    const result = { fileId: file._id, filename: fileName, courseId: courseId, cards: cards };

    console.log("Created flashcards:", result);


    return result;
}

interface FileData {
    filename: string;
    buffer: Buffer;
}

async function processFiles(files: FileData[], fileId: Types.ObjectId): Promise<any> {

    const cards = [];
    let llmResult;
    
    for (const file of files) {
        try {
            console.log(`Processing file: ${file.filename}`);
            
            // Convert PDF buffer to base64 for API transmission
            const base64Data = file.buffer.toString('base64');
            
            // Call LLM API to process the PDF
            llmResult = await callLLMApi({
                filename: file.filename,
                content: base64Data,
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
            console.error(`Error processing file ${file.filename}:`, error);
            return Promise.reject(error);
        }
    }
    
    return cards;
}

