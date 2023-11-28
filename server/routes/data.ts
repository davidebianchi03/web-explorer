import * as fs from "fs";
import * as tar from "tar";
import * as path from "path";
import { Request, Response, Router } from "express";
import { GetConnectionByUuid, GetConnections } from "../db/data-queries";
import {
  Exists,
  GetChildren,
  getFileContent,
  getPermissions,
  isDirectory,
  upload,
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

router.get("/download/:path", async (req: Request, res: Response) => {
  if (!fs.existsSync(req.params.path)) {
    res.status(404).json({ description: "File not found" });
    return;
  }

  let output_filename = path.basename(req.params.path);
  if (isDirectory(req.params.path)) {
    output_filename = output_filename + ".tar.gz";
    let archive_path = path.join(__dirname, output_filename);

    if (fs.existsSync(archive_path)) {
      fs.unlinkSync(archive_path);
    }

    try {
      fs.createWriteStream(archive_path);
      await tar.create({ file: archive_path }, [req.params.path]);
      res.set("Content-Type", "application/gzip");
      res.set("Content-Disposition", `attachment; filename=${output_filename}`);
      fs.createReadStream(archive_path).pipe(res);
      res.status(200);
      return;
    } catch (error) {
      res.status(500).json({ description: "Cannot create tar.gz archive" });
      return;
    }
  } else {
    let file = fs.readFileSync(req.params.path);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + output_filename
    );
    res.status(200).send(file);
    return;
  }
});

router.post("/upload/:path", async (req: Request, res: Response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: "Missing field 'file'" });
  }

  let uploaded_files = req.files as Express.Multer.File[];
  let file = null;
  for (let i = 0; i < uploaded_files.length; i++) {
    if (uploaded_files[i].fieldname == "file") {
      file = uploaded_files[i] as Express.Multer.File;
      break;
    }
  }

  if (!file) {
    return res.status(400).json({ message: "Missing field 'file'" });
  }

  if (fs.existsSync(req.params.path)) {
    return res.status(409).json({ message: "Path already exists" });
  }

  try {
    fs.writeFileSync(req.params.path, file.buffer);
    return res.status(200).json({ message: "File successfully uploaded" });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

router.delete("/delete/:path", async (req: Request, res: Response) => {
  if (!fs.existsSync(req.params.path)) {
    return res.status(404).json({ message: "Selected path does not exist" });
  }

  try {
    if (isDirectory(req.params.path)) {
      fs.rmSync(req.params.path, { recursive: true, force: true });
    } else {
      fs.unlinkSync(req.params.path);
    }
    return res
      .status(200)
      .json({ message: "File has been successfully deleted" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/content/:path", async (req: Request, res: Response) => {
  if (!fs.existsSync(req.params.path)) {
    return res.status(404).json({ message: "Selected path does not exist" });
  }

  try {
    return res.status(200).json({ content: getFileContent(req.params.path) });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/content/:path", async (req: Request, res: Response) => {
  if (!req.body.content) {
    return res.status(400).json({ message: "Missing 'content' param" });
  }

  try {
    fs.writeFileSync(req.params.path, req.body.content);
    return res
      .status(200)
      .json({ message: "File has been successfully saved" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.patch("/rename/:path", async (req: Request, res: Response) => {
  if (!req.body.filename) {
    return res.status(400).json({ message: "Missing 'filename' param" });
  }
  if (!fs.existsSync(req.params.path)) {
    return res.status(400).json({ message: "Selected path does not exist" });
  }

  let old_path = req.params.path;
  let new_path = path.join(path.dirname(req.params.path), req.body.filename);

  if (fs.existsSync(new_path)) {
    return res.status(409).json({ message: "Path already exists" });
  }

  try {
    fs.renameSync(old_path, new_path);
    return res
      .status(200)
      .json({ message: "Path has been successfully renamed" });
  }
  catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.post("/path", async (req: Request, res: Response) => {
  if (!req.body.type) {
    return res.status(400).json({ message: "Missing 'type' param" });
  }
  if (req.body.type != "dir" && req.body.type != "file") {
    return res.status(400).json({ message: "Invalid string for 'type', valid values are 'dir' and 'file'" });
  }
  if (!req.body.path) {
    return res.status(400).json({ message: "Missing 'path' param" });
  }
  if (fs.existsSync(req.body.path)) {
    return res.status(400).json({ message: "Path already exists" });
  }

  try {
    if (req.body.type == "dir") {
      fs.mkdirSync(req.body.path);
    } else {
      fs.writeFileSync(req.body.path, "");
    }

    return res
      .status(200)
      .json({ message: "Path has been successfully created" });
  }
  catch (error) {
    return res.status(500).json({ message: error });
  }
});

router.get("/properties/:path", async (req: Request, res: Response) => {
  if (!fs.existsSync(req.params.path)) {
    res.status(404).json({ message: "Path not found" });
  }

  let data = {
    filename: "",
    path: "",
    size: 0,
    permissions: {},
    creation_date: "",
    modified_on: ""
  };
  try {
    let file_stats = fs.statSync(req.params.path);
    data.filename = path.basename(req.params.path);
    data.path = req.params.path;
    data.modified_on = file_stats.mtime.toISOString();
    data.creation_date = file_stats.ctime.toISOString();
    data.permissions = getPermissions(req.params.path);

    if (!isDirectory(req.params.path)) {
      data.size = file_stats.size;
    }

    return res
      .status(200)
      .json({ data: data });
  }
  catch (error) {
    return res.status(500).json({ message: error });
  }
});
