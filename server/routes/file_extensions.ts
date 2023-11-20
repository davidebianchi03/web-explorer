import * as fs from "fs";
import * as path from "path";
import { Request, Response, Router } from "express";

export const router = Router();

router.get("/:file_extension?", async (req: Request, res: Response) => {
  let file_content = fs.readFileSync(
    `${path.dirname(__dirname)}/default-file-extensions.json`,
    {
      encoding: "utf-8",
    }
  );
  let json_list = JSON.parse(file_content);
  for (let i = 0; i < json_list.length; i++) {
    if (json_list[i].extensions.includes(req.params.file_extension)) {
      return res.status(200).json({ language: json_list[i].name });
    }
  }
  return res.status(200).json({ language: null });
});
