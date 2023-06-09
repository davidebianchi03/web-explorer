import express, { Express, Request, Response } from "express";
import { router as data_router } from "./routes/data";
import cors from "cors";
import path from "path";

export function createApp(production: boolean): Express {
  const app: Express = express();

  if (production) {
    app.use("", express.static(path.join(__dirname, "/react")));
    app.get("", (req: Request, res: Response) => {
      return res
        .status(200)
        .sendFile(path.join(__dirname, "/react/index.html"));
    });
  } else {
    app.get("/", function (req, res) {
      res.send("Server is in develop mode");
    });
  }

  // cors
  app.use(
    cors({
      origin: "*",
    })
  );

  // routes
  app.use("/data", data_router);

  return app;
}
