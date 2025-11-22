import express from "express";

const router = express.Router();

router.use((req, res, next) => {
  /* #swagger.tags = ['Advisors'] */
  next();
});

router.get("/hello", (req, res) => {
  /* #swagger.description = 'Endpoint to return a hello world message.' */
  res.status(200).json("Hello, World!");
});

export default router;
