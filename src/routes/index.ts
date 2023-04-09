import { Router } from "express";
import prisma from "../prisma";
export const router = Router();

router.get("/", async (req, res) => {
  let connections = await prisma.connection.findMany();
  res.status(200).render("pages/index", {
    connections: connections,
  });
});
