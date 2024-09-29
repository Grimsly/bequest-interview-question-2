import express from "express";
import cors from "cors";
import {
  getCurrentData,
  getPreviousVersionData,
  insertData,
} from "./database/database";

const PORT = 8080;
const app = express();

app.use(cors());
app.use(express.json());

// Routes

app.get("/", async (_req, res) => {
  const current_data = await getCurrentData();
  if (current_data) {
    res.json(current_data);
  } else {
    res.json({ data: "", pill: "" });
  }
});

app.get("/revert", async (_req, res) => {
  try {
    const previous_data = await getPreviousVersionData();
    res.json(previous_data);
  } catch (error) {
    if (error instanceof Error) {
      // If there is an error, meaning that a previous version couldn't be found or another issue occurred,
      // respond with an initial state
      res.status(404).json({ data: "", pill: "", message: error.message });
    }
  }
});

app.post("/", (req, res) => {
  insertData(req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
