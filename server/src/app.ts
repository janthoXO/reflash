import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import controller from "./controller.js";
import { run } from "./db/db.js";
import { startLLMSession } from "./llmservice.js";

dotenv.config();

// Initialize express app
const app = express();
const PORT = Number(process.env.PORT) || 8080; // Port configuration

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Filename');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware for handling file uploads
app.use(express.raw({ type: 'application/pdf', limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiRouter = express.Router();

apiRouter.use("", controller);

app.use("/api", apiRouter);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
  run().then
  (() => {
    console.log("Connected to the database.");
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  }); 

  try {
    startLLMSession();
  } catch (error) {
    console.error("Failed to start LLM session:", error);
  }
  
  
});
