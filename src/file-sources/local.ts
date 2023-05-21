import * as fs from "fs";
import isBinaryPath from "is-binary-path";
import * as path from "path";


export function GetRoot(): string {
  let root = path.resolve(__dirname).split(path.sep)[0];
  if (root == "") {
    root = path.sep;
  }
  return root;
}

export async function GetChildren(_path: string) {
  let children = fs.readdirSync(_path);
  

  class Child {
    name: string = "";
    type: string = "";
    icon: string = "";

    constructor(name:string, type:string, icon:string){
        this.name = name
        this.type = type
        this.icon = icon;
    }
  }

  let response_body = { children: new Array<Child> };

  for (let i = 0; i < children.length; i++) {
    let child_element_path = path.join(_path, children[i]);
    if (fs.statSync(child_element_path).isDirectory()) {
      response_body.children.push(new Child(children[i], "dir", "/static/img/folder.svg"));
    } else {
        let binary = isBinaryPath(child_element_path);
        response_body.children.push(new Child(children[i], "file", "/static/img/folder.svg"));
    }
  }

  return response_body;
}
