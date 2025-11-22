import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import controller from "./controller.js";

dotenv.config();

// Initialize express app
const app = express();
const PORT = Number(process.env.PORT) || 8080; // Port configuration

const apiRouter = express.Router();

apiRouter.use("/controller", controller);

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
});
