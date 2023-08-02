import { Request, Response, Router } from "express";
import { GetConnectionByUuid, GetConnections } from "../db/data-queries";
import {
  Exists,
  GetChildren,
  getPermissions,
  isDirectory,
} from "../data-source/local";

export const router = Router();

router.get("/connections/:id?", async (req: Request, res: Response) => {
  if (req.params.id === undefined) {
    res.status(200).json(await GetConnections());
  } else {
    let connection = await GetConnectionByUuid(req.params.connection_id);
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
    let connection = await GetConnectionByUuid(req.params.connection_id);
    if (connection) {
      if (Exists(req.params.path) && isDirectory(req.params.path)) {
        // check if user has permissions to read the selected folder
        let permissions = getPermissions(req.params.path);
        if (permissions.read && permissions.execute) {
          return res.status(200).json(await GetChildren(req.params.path));
        } else {
          return res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        res.status(404).json({ description: "Folder not found" });
      }
    } else {
      res.status(404).json({ description: "Connection not found" });
    }
  }
);
