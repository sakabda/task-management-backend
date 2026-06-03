import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes";
import globalErrorHandler from "./middlewares/error.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use(globalErrorHandler);

app.get("/", (req, res) => {
  res.send("API Running...");
});

export default app;
