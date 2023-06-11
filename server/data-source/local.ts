import * as fs from "fs";
import isBinaryPath from "is-binary-path";
import * as path from "path";
import { humanFileSize } from "../utils";

export function GetRoot(): string {
  let root = path.resolve(__dirname).split(path.sep)[0];
  if (root === "") {
    root = path.sep;
  }
  return root;
}

export function Exists(_path: string): boolean {
  return fs.existsSync(_path);
}

export async function GetChildren(_path: string) {
  let children = fs.readdirSync(_path);
  class Child {
    name: string = "";
    type: string = "";
    icon: string = "";
    size: string = "";
    last_modified = "";
    permissions: Permissions;

    constructor(
      name: string,
      type: string,
      icon: string,
      size: string,
      last_modified: string,
      permissions: Permissions
    ) {
      this.name = name;
      this.type = type;
      this.icon = icon;
      this.size = size;
      this.last_modified = last_modified;
      this.permissions = permissions;
    }
  }

  let response_body = { children: new Array<Child>() };

  for (let i = 0; i < children.length; i++) {
    let child_element_path = path.join(_path, children[i]);
    let file_stats = fs.statSync(child_element_path);
    let last_modified_date =
      file_stats.mtime.toLocaleDateString() +
      " " +
      file_stats.mtime.toLocaleTimeString();
    let permission = getPermissions(child_element_path);
    if (fs.statSync(child_element_path).isDirectory()) {
      response_body.children.push(
        new Child(
          children[i],
          "dir",
          (process.env.REACT_APP_ENVIRONMENT === "develop"
            ? `http://${process.env.REACT_APP_SERVER_HOSTNAME}:${process.env.REACT_APP_SERVER_PORT}`
            : "") + "/file-icons/folder.svg",
          "",
          last_modified_date,
          permission
        )
      );
    } else {
      let binary = isBinaryPath(child_element_path);
      if (binary) {
        response_body.children.push(
          new Child(
            children[i],
            "bin-file",
            (process.env.REACT_APP_ENVIRONMENT === "develop"
              ? `http://${process.env.REACT_APP_SERVER_HOSTNAME}:${process.env.REACT_APP_SERVER_PORT}`
              : "") + "/file-icons/bin.svg",
            humanFileSize(file_stats.size).toString(),
            last_modified_date,
            permission
          )
        );
      } else {
        response_body.children.push(
          new Child(
            children[i],
            "txt-file",
            (process.env.REACT_APP_ENVIRONMENT === "develop"
              ? `http://${process.env.REACT_APP_SERVER_HOSTNAME}:${process.env.REACT_APP_SERVER_PORT}`
              : "") + "/file-icons/txt.svg",
            humanFileSize(file_stats.size).toString(),
            last_modified_date,
            permission
          )
        );
      }
    }
  }
  return response_body;
}

export function isDirectory(path: string): boolean {
  return fs.statSync(path).isDirectory();
}

type Permissions = {
  read: boolean;
  write: boolean;
  execute: boolean;
};

export function getPermissions(path: string): Permissions {
  let read = false;
  let write = false;
  let execute = false;

  try {
    fs.accessSync(path, fs.constants.R_OK);
    read = true;
  } catch (exception) {}

  try {
    fs.accessSync(path, fs.constants.W_OK);
    write = true;
  } catch (exception) {}

  try {
    fs.accessSync(path, fs.constants.X_OK);
    execute = true;
  } catch (exception) {}

  return {
    read: read,
    write: write,
    execute: execute,
  };
}

// export async function DownloadFile(_path: string, req: any, res: any) {
//   let file = fs.readFileSync(_path);
//   res.setHeader(
//     "Content-disposition",
//     "attachment; filename=" + path.basename(_path)
//   );
//   res.send(file);
// }
