import { Express } from "express";

let circuits: any[] = [];

export function registerRoutes(app: Express) {
  app.get("/api/circuits", (req, res) => {
    res.json(circuits);
  });

  app.post("/api/circuits", (req, res) => {
    const circuit = {
      id: Date.now(),
      ...req.body,
    };
    circuits.push(circuit);
    res.json(circuit);
  });

  app.delete("/api/circuits/:id", (req, res) => {
    circuits = circuits.filter(c => c.id !== Number(req.params.id));
    res.sendStatus(204);
  });
}
