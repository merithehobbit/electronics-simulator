import express from "express";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

// API route
app.get("/api", (req, res) => {
  res.json({ message: "Electronics simulator backend running" });
});

// serve frontend
app.use(express.static(path.join(process.cwd(), "project/client")));

// homepage fallback (so / doesn't look empty)
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "project/client/index.html"));
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});