import * as fs from "fs";
import isBinaryPath from "is-binary-path";
import * as path from "path";

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

    constructor(
      name: string,
      type: string,
      icon: string,
      size: string,
      last_modified: string
    ) {
      this.name = name;
      this.type = type;
      this.icon = icon;
      this.size = size;
      this.last_modified = last_modified;
    }
  }

  let response_body = { children: new Array<Child>() };

  for (let i = 0; i < children.length; i++) {
    let child_element_path = path.join(_path, children[i]);
    let file_stats = fs.statSync(child_element_path);
    let last_modified_date = file_stats.mtime.toLocaleDateString() + ' ' + file_stats.mtime.toLocaleTimeString();
    if (fs.statSync(child_element_path).isDirectory()) {
      response_body.children.push(
        new Child(children[i], "dir", "/static/img/folder.svg", '', last_modified_date)
      );
    } else {
      let binary = isBinaryPath(child_element_path);
      console.log(file_stats.size);
      if (binary) {
        response_body.children.push(
          new Child(
            children[i],
            "bin-file",
            "/static/img/files/bin.svg",
            "",
            last_modified_date
          )
        );
      } else {
        response_body.children.push(
          new Child(
            children[i],
            "txt-file",
            "/static/img/files/txt.svg",
            file_stats.size.toString(),
            last_modified_date
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

// export async function DownloadFile(_path: string, req: any, res: any) {
//   let file = fs.readFileSync(_path);
//   res.setHeader(
//     "Content-disposition",
//     "attachment; filename=" + path.basename(_path)
//   );
//   res.send(file);
// }
