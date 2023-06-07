import express, { Express, Request, Response, Router } from "express";
import { GetConnections } from "../db/data-queries";

export const router = Router();

router.get("/connections/:id?", async (req: Request, res: Response) => {
  if (req.params.id === undefined) {
    res.status(200).json(await GetConnections());
  } else {
    // TODO:
  }
});
