import express from "express";
import cors from "cors";
import { getLatestData, insertData } from "./database/database";

const PORT = 8080;
const app = express();
const database = { data: "Hello World" };

app.use(cors());
app.use(express.json());

// Routes

app.get("/", (req, res) => {
  res.json(getLatestData());
});

app.post("/", (req, res) => {
  database.data = req.body.data;
  insertData(database);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
