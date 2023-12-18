import React from "react";
import "./styles/FileExplorer.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus, faFileCirclePlus, faUpload, faRotate, faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { ChildItem } from "../../types";
import folder_icon from "../../icons/folder.png";
import file_icon from "../../icons/file.png";

type FileExplorerProps = {
    initialPath: string;
}

type FileExplorerState = {
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
            callback: () => { }
        },
        {
            key: 1,
            title: "New File",
            icon: faFileCirclePlus,
            callback: () => { }
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
            callback: () => { }
        }
    ]

    current_path: string;

    constructor(props: FileExplorerProps) {
        super(props);
        this.current_path = props.initialPath;
        this.state = {
            children: [
                {
                    key: 1,
                    is_folder: false,
                    abs_path: "",
                    name: "item1",
                    modified_on: new Date(Date.now()),
                    parent: "",
                    permissions: 777,
                    editable: false,
                    children: []
                }
            ]
        }
    }

    componentDidMount(): void {

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
                                <FontAwesomeIcon icon={faCaretDown} className="dropdown"/>
                                <img src={folder_icon} className="type"/>
                                <span className="name">Folder Name</span>
                                {/* <ul>
                                    <li>
                                        <span>Child 1</span>
                                    </li>
                                </ul> */}
                            </li>
                        </ul>
                    </div>
                    <div className="files">
                        <div className="row header">
                            <div className="type">
                                <img src={folder_icon} width={25} height={25} alt="type"/>
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
                            <div className="row">
                                <div className="type">
                                    <img src={child.is_folder ? folder_icon : file_icon} width={25} height={25} alt="type"/>
                                </div>
                                <div className="name">
                                    <span>{child.name}</span>
                                </div>
                                <div className="modified">
                                    <span>{`${child.modified_on.toLocaleDateString()} ${child.modified_on.getHours()}:${child.modified_on.getMinutes()}`}</span>
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