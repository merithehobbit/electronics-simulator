import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

registerRoutes(app);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
