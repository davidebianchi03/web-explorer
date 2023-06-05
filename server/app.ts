import express, { Express, Request, Response } from "express";
import { router as data_router } from "./routes/data";

export function createApp(production: boolean): Express {
  const app: Express = express();
  
  if (production) {
    // TODO: serve compiled react files
  } else {
    app.get("/", function (req, res) {
      res.send("Server is in develop mode");
    });
  }

  // routes
  app.use("/data", data_router);

  return app;
}
