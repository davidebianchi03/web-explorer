import React from "react";
import "./styles/FileExplorer.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faFileCirclePlus, faUpload, faRotate, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ChildItem } from "../../types";
import folder_icon from "../../icons/folder.png";
import file_icon from "../../icons/file.png";
import { Requests } from "./Requests";
import { FixPath, PadWithZero } from "../../utils";
import Swal from 'sweetalert2'

type FileExplorerProps = {
    initialPath: string;
}

type FileExplorerState = {
    folder_name: string,
    children: ChildItem[]
}

type TitleBarOption = {
    key: number,
    title: string,
    icon: IconProp,
    callback: Function,
}

export default class FileExplorer extends React.Component<FileExplorerProps> {

    state: FileExplorerState;
    titlebar_options: TitleBarOption[] = [
        {
            key: 1,
            title: "New Folder",
            icon: faFolderPlus,
            callback: () => this.createFolder(""),
        },
        {
            key: 1,
            title: "New File",
            icon: faFileCirclePlus,
            callback: () => this.createFile(""),
        },
        {
            key: 2,
            title: "Upload",
            icon: faUpload,
            callback: () => { }
        },
        {
            key: 3,
            title: "Refresh",
            icon: faRotate,
            callback: () => this.loadChildren(),
        }
    ]

    current_path: string;

    constructor(props: FileExplorerProps) {
        super(props);
        this.current_path = props.initialPath;
        this.state = {
            folder_name: "/",
            children: []
        }
    }

    componentDidMount(): void {
        this.loadChildren();
    }

    loadChildren = async () => {
        var response = await Requests.GetChildren(this.current_path);
        if (response.success) {
            var data = response.json_content as ChildItem[];
            data = data.map((child) => (
                {
                    ...child,
                    editable: false,
                    children: []
                }
            ));
            this.setState({
                children: data
            });
        } else {
            // TODO: print error
        }
    }

    openChildItem = async (element: ChildItem) => {
        if (element.is_directory) {
            this.current_path = FixPath(element.absolute_path);
            this.loadChildren();
        } else {
            // TODO: open file
        }
    }

    createFolder = async (folder_initial_name: string|null) => {
        var swal_result = await Swal.fire({
            title: "Create new folder",
            input: "text",
            inputValue: folder_initial_name ? folder_initial_name : "",
            inputAttributes: {
                placeholder: "Folder name"
            }
        });

        if (swal_result.isConfirmed) {
            var response = await Requests.CreatePath(this.current_path, swal_result.value, true, 700);
            if (response.success) {
                this.loadChildren();
            }
            else if (response.status_code === 404) {
                // parent path not found
                await Swal.fire({
                    icon: "error",
                    title: "Parent folder not found!",
                    text: `Path ${this.current_path} does not exist!`
                });
                console.log(this.current_path)
            }
            else if (response.status_code === 409) {
                // folder already exists
                await Swal.fire({
                    icon: "error",
                    title: "Item already exists!",
                    text: `Item with name ${swal_result.value} alredy exists!`
                });
                this.createFolder(swal_result.value);
            }
            else {
                await Swal.fire({
                    icon: "error",
                    title: "Cannot create folder",
                    text: `Unknown error ${response.status_code}`
                });
            }
        }
    }

    createFile = async(file_initial_name: string|null) => {
        var swal_result = await Swal.fire({
            title: "Create new file",
            input: "text",
            inputValue: file_initial_name ? file_initial_name : "",
            inputAttributes: {
                placeholder: "File name"
            }
        });

        if (swal_result.isConfirmed) {
            var response = await Requests.CreatePath(this.current_path, swal_result.value, false, 700);
            if (response.success) {
                this.loadChildren();
            }
            else if (response.status_code === 404) {
                // parent path not found
                await Swal.fire({
                    icon: "error",
                    title: "Parent folder not found!",
                    text: `Path ${this.current_path} does not exist!`
                });
                console.log(this.current_path)
            }
            else if (response.status_code === 409) {
                // folder already exists
                await Swal.fire({
                    icon: "error",
                    title: "Item already exists!",
                    text: `Item with name ${swal_result.value} alredy exists!`
                });
                this.createFile(swal_result.value);
            }
            else {
                await Swal.fire({
                    icon: "error",
                    title: "Cannot create folder",
                    text: `Unknown error ${response.status_code}`
                });
            }
        }
    }

    render(): React.ReactNode {
        return (
            <div className="file-explorer">
                <div className="titlebar">
                    {this.titlebar_options.map(option => (
                        <span onClick={(e) => option.callback(e)} className="titlebar-option">
                            <FontAwesomeIcon icon={option.icon} className="icon" />
                            <span className="title">{option.title}</span>
                        </span>
                    ))}
                </div>
                <div className="search-bar">
                    <span>Files</span>
                    <input placeholder="Search Files" />
                </div>
                <div className="explorer">
                    <div className="tree">
                        <ul>
                            <li className="dropdown-element">
                                <span className="dropdown-header">
                                    <FontAwesomeIcon icon={faCaretDown} className="dropdown" />
                                    <img src={folder_icon} className="type" alt="" />
                                    <span className="name">{this.state.folder_name}</span>
                                </span>
                                <ul>

                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div className="files">
                        <div className="row header">
                            <div className="type">
                                <img src={folder_icon} width={25} height={25} alt="type" />
                            </div>
                            <div className="name">
                                <span>Name</span>
                            </div>
                            <div className="modified">
                                <span>Modified</span>
                            </div>
                            <div className="permissions">
                                <span>Permissions</span>
                            </div>
                        </div>
                        {this.state.children.map(child => (
                            <div className="row" onDoubleClick={() => this.openChildItem(child)}>
                                <div className="type">
                                    <img src={child.is_directory ? folder_icon : file_icon} width={25} height={25} alt="type" />
                                </div>
                                <div className="name">
                                    <span>{child.name}</span>
                                </div>
                                <div className="modified">
                                    <span>
                                        {
                                            `
                                            ${new Date(child.modification_time).toLocaleDateString()} 
                                            ${PadWithZero(new Date(child.modification_time).getHours())}:${PadWithZero(new Date(child.modification_time).getMinutes())}
                                        `
                                        }
                                    </span>
                                </div>
                                <div className="permissions">
                                    <span>{child.permissions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

}