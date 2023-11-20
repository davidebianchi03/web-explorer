import express, { Express, Request, Response } from "express";
import { router as data_router } from "./routes/data";
import { router as file_extension_router } from "./routes/file_extensions";
import cors from "cors";
import path from "path";
import { LoadConnectionsFromEnvironment } from "./utils";
import multer from "multer";

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

  app.use("/file-icons", express.static(path.join(__dirname, "/file-icons")));

  // cors
  app.use(
    cors({
      origin: "*",
    })
  );

  // body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(multer().any());

  // routes
  app.use("/data", data_router);
  app.use("/file-extensions", file_extension_router);

  LoadConnectionsFromEnvironment();
 
  return app;
}
