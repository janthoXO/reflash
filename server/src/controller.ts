import express from "express";
import { checkFilesInDB, getFlashcardsByCourseIds, createCards, getTimer } from "./service";
import Flashcard from "./flashcard";

const router = express.Router();

router.use((req, res, next) => {
  /* #swagger.tags = ['Advisors'] */
  next();
});

router.get("/hello", (req, res) => {
  /* #swagger.description = 'Endpoint to return a hello world message.' */
  res.status(200).json("Hello, World!");
});

router.get("/hello2", (req, res) => {
  /* #swagger.description = 'Endpoint to return a hello world message.' */
  res.status(200).json("Hello, lara!");
});


router.get("/files", async (req, res) => {
  /* #swagger.description = 'Check if files are in the databse.' */
  
  const fileNames = req.query.filenames as string[];
  console.log("Received file names:", fileNames);

  let map: Map<string, boolean>;
  try {
    const namesArray = Array.isArray(fileNames) ? fileNames : [fileNames];
    map = await checkFilesInDB(namesArray);
  } catch (error) {
    console.error("Error checking files in DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }

  const obj = Object.fromEntries(map);

  res.status(200).json(obj);
});


router.get("/getcards", async (req, res) => {
  /* #swagger.description = 'Endpoint to get flashcards.' */  

  const courseIds = req.query.courseIds as string[];
  console.log("Received file names:", courseIds);

  let flashcards: Flashcard[];
  try {
    const idArray = Array.isArray(courseIds) ? courseIds : [courseIds];
    flashcards = await getFlashcardsByCourseIds(idArray);
  } catch (error) {
    console.error("Error checking files in DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }

  console.log("Retrieved flashcards:", flashcards);

  return res.status(200).json(flashcards);
});

router.get("/flashcardtime", async (req, res) => {
  /* #swagger.description = 'Endpoint to get a flashcards repitition timer.' */
  const {userId, cardId} = req.query;

  if (!userId || typeof userId !== 'string' || !cardId || typeof cardId !== 'string') {
    return res.status(400).json({ message: 'userId and cardId query parameters are required' });
  }

  try {
    const time = await getTimer(userId, cardId);
    return res.status(200).json(time);
  } catch (error) {
    console.error("Error getting timer from DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
  
});





router.post("/courses/:courseId/files", async (req, res) => {
  /* #swagger.description = 'Endpoint to upload files and process them into flashcards.' */
  
  try {
    const contentType = req.headers['content-type'];

    const {courseUrl} = req.query;

    if (!courseUrl || typeof courseUrl !== 'string') {
      return res.status(400).json({ message: 'courseUrl query parameter is required' });
    }
    
    if (!contentType || !contentType.includes('application/pdf')) {
      console.log('Invalid content type:', contentType);
      return res.status(400).json({ message: 'Only PDF files are supported' });
    }

    const pdfBuffer = req.body as Buffer;
    
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(400).json({ message: 'No file data received' });
    }

    const filename = req.headers['x-filename'] as string;

    console.log(`Processing PDF file: ${filename}, size: ${pdfBuffer.length} bytes`);

    const result = await createCards([{ filename: filename, buffer: pdfBuffer }], courseUrl, filename);
    
    res.status(200).json(result);

  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }

});

export default router;