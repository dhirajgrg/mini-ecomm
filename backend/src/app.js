import express from "express";
const app = express();

import morgan from "morgan";
import cors from "cors";

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log(`Route is healthy`);
});

export default app;
