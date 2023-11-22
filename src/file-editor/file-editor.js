import "./file-editor.css";
import { Component } from "react";
import Editor from '@monaco-editor/react';
import { GetFileContent, GetLanguageFromFileExtension, SaveFile } from "../http-requests/http-requests";
import Swal from "sweetalert2";
import save_green from "../img/save-green.png";
import save_red from "../img/save-red.png";

export default class FileEditor extends Component {
    constructor(props) {
        super(props);
        this.light_theme = "vs-light";
        this.dark_theme = "vs-dark";
        this.state = {
            selected_theme: this.light_theme,
            content: "",
            language: null,
            saved: true,
        }
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkThemeMq.matches) {
            this.state.selected_theme = this.dark_theme;
        }
    }

    componentDidMount() {
        this.loadFileContent();
    }

    loadFileContent = async () => {
        let result = await GetFileContent(this.props.filepath);
        if (!result.error) {
            this.setState({
                content: result.data.content
            });
            let file_ext = this.props.filepath.split('.').pop();
            result = await GetLanguageFromFileExtension(file_ext);
            if (!result.error) {
                let language = result.data.language;
                this.setState({
                    language: language
                });
            } else {
            }
        } else {
        }
    }

    handleKeyPressed = async (event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveFile();
        } else {
            this.setState({ saved: false });
        }
    }

    saveFile = async()=>{
        let result = await SaveFile(this.props.filepath, this.state.content);
        if (result.error) {
            Swal.fire(result.statusCode, result.data, "error");
        } else {
            this.setState({ saved: true });
        }
    }

    render() {
        return (
            <div className={`editor-container ${this.state.selected_theme === this.light_theme ? "light" : "dark"}`} onKeyDown={this.handleKeyPressed}>
                <div className="header">
                    {/* <select className="select-theme">
                    <option value={"light_theme"}>&#127774;</option>
                    <option value={"dark_theme"}>&#127769;</option>
                </select> */}
                    <button className="save-btn">
                        <img src={this.state.saved ? save_green : save_red}/>
                    </button>
                </div>
                <Editor
                    height={"100%"}
                    width={"100%"}
                    defaultLanguage="txt"
                    theme={this.state.selected_theme}
                    value={this.state.content}
                    language={this.state.language}
                    onChange={(text) => { this.setState({ content: text }); }}
                />
            </div>);
    }
}