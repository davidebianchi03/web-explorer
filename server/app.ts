import express, { Express, Request, Response } from "express";
import { router as data_router } from "./routes/data";
import cors from "cors";

export function createApp(production: boolean): Express {
  const app: Express = express();

  if (production) {
    // TODO: serve compiled react files
  } else {
    app.get("/", function (req, res) {
      res.send("Server is in develop mode");
    });
  }

  // cors
  app.use(cors({
    origin: '*'
  }));

  // routes
  app.use("/data", data_router);

  return app;
}
