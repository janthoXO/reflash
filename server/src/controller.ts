import express from "express";
import { checkFilesInDB, getFlashcardsByCourseIds, createCards, getTimer, updateCard, getUserStats, associateCourseWithUser } from "./service";
import Flashcard from "./flashcard";

const router = express.Router();

router.use((req, res, next) => {
  /* #swagger.tags = ['Advisors'] */
  next();
});


router.get("/courses/:courseId/files", async (req, res) => {
  /* #swagger.description = 'Check if files are in the databse.' */
  
  const fileUrls = req.query.fileUrls as string[];
  const courseUrl = req.query.courseUrl as string;
  const userId = req.query.userId as string;

  console.log("Received file urls:", fileUrls);
  console.log("Received course url:", courseUrl);
  console.log("Received user id:", userId);

  let map: Map<string, boolean>;
  try {
    const urlArray = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
    map = await checkFilesInDB(urlArray);
    await associateCourseWithUser(courseUrl, userId);
  } catch (error) {
    console.error("Error checking files in DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }

  const obj = Object.fromEntries(map);

  res.status(200).json(obj);
});


router.get("/cards", async (req, res) => {
  /* #swagger.description = 'Endpoint to get all due flashcards.' */  

  const {courseUrl, userId} = req.query;


  let flashcards: Flashcard[];
  try {
    const urlArray = Array.isArray(courseUrl) ? courseUrl : [courseUrl];
    flashcards = await getFlashcardsByCourseIds(urlArray as string, userId as string);
  } catch (error) {
    console.error("Error checking files in DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }

  console.log("Retrieved flashcards:", flashcards);

  return res.status(200).json(flashcards);
});


router.put("/flashcard", async (req, res) => {
  /* #swagger.description = 'Endpoint to send flashcard result.' */
  const {userId, cardId, solved}: {userId: string, cardId: string, solved: boolean} = req.body;

  try {    
    const msg = await updateCard(userId, cardId, solved);
    return res.status(200).json({ message: 'Flashcard result updated successfully. ' + msg });
  } catch (error) {
    console.error("Error updating flashcard result in DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }

});

router.get("/user", async (req, res) => {
  /* #swagger.description = 'Endpoint to get user data.' */

  const {userId} = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'userId query parameter is required' });
  }
  try {    
    const {streak, lastStudied, courses} = await getUserStats(userId);
    return res.status(200).json({streak, lastStudied, courses});
  } catch (error) {
    console.error("Error getting user stats from DB:", error);
    return res.status(500).json({ message: error instanceof Error ? error.message : String(error) });
  }
});


router.post("/courses/:courseId/files", async (req, res) => {
  /* #swagger.description = 'Endpoint to upload files and process them into flashcards.' */
  
  try {

    const userId = req.query.userId as string;
    const {courseUrl, fileUrl, filename, data} = req.body;

    if (!courseUrl || typeof courseUrl !== 'string') {
      return res.status(400).json({ message: 'courseUrl query parameter is required' });
    }
    
    
    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'No file data received' });
    }

    //const filename = req.headers['x-filename'] as string;

    const result = await createCards(data, courseUrl, filename, fileUrl, userId);
    
    res.status(200).json(result);

  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Internal server error' 
    });
  }

});

export default router;