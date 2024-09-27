import express from "express";
import cors from "cors";
import { getLatestData, insertData } from "./database/database";

const PORT = 8080;
const app = express();

app.use(cors());
app.use(express.json());

// Routes

app.get("/", (req, res) => {
  const latest_data = getLatestData();
  if (latest_data) {
    res.json(getLatestData());
  } else {
    res.json({ data: "", pill: "" });
  }
});

app.post("/", (req, res) => {
  insertData(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
