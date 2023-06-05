import express, { Express, Request, Response, Router } from "express";

export const router = Router();

router.get("/connections/:id?", async (req: Request, res: Response) => {
  res.status(200).send(req.params.id);
});
