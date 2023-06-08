import { Request, Response, Router } from "express";
import { GetConnection, GetConnections } from "../db/data-queries";
import { Exists, GetChildren } from "../data-source/local";

export const router = Router();

router.get("/connections/:id?", async (req: Request, res: Response) => {
  if (req.params.id === undefined) {
    res.status(200).json(await GetConnections());
  } else {
    let connection = await GetConnection(req.params.connection_id);
    if (connection) {
      return res.status(200).json(connection);
    } else {
      res.status(404).json({ description: "Not found" });
    }
  }
});

router.get(
  "/children/:connection_id/:path",
  async (req: Request, res: Response) => {
    let connection = await GetConnection(req.params.connection_id);
    if (connection) {
      if (Exists(req.params.path)) {
        return res.status(200).json(await GetChildren(req.params.path));
      } else {
        res.status(404).json({ description: "Path not found" });
      }
    } else {
      res.status(404).json({ description: "Connection not found" });
    }
  }
);
