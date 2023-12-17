import React from "react";
import "./styles/FileExplorer.css"
import plus_icon from "../../icons/plus.png"
import upload_icon from "../../icons/upload.png"
import refresh_icon from "../../icons/update.png"

type FileExplorerProps = {
    initialPath: string;
}

type FileExplorerState = {

}

type TitleBarOption = {
    title: string,
    icon: string,
    callback: Function,
}

export default class FileExplorer extends React.Component<FileExplorerProps> {

    state: FileExplorerState;
    titlebar_options: TitleBarOption[] = [
        {
            title: "New folder",
            icon: plus_icon,
            callback: () => { }
        },
        {
            title: "Upload",
            icon: upload_icon,
            callback: () => { }
        },
        {
            title: "Refresh",
            icon: refresh_icon,
            callback: () => { }
        }
    ]

    current_path:string;

    constructor(props: FileExplorerProps) {
        super(props);
        this.current_path = props.initialPath;
        this.state = {}
    }

    componentDidMount(): void {
        
    }

    render(): React.ReactNode {
        return (
            <div className="file-explorer">
                <div className="titlebar">
                    {this.titlebar_options.map(option => (
                        <span onClick={(e) => option.callback(e)} className="titlebar-option">
                            <img src={option.icon} className="icon"/>
                            <span className="title">{option.title}</span>
                        </span>
                    ))}
                </div>
            </div>
        )
    }

}