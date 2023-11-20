import "./file-editor.css";
import { Component } from "react";
import Editor from '@monaco-editor/react';
import { GetFileContent, GetLanguageFromFileExtension } from "../http-requests/http-requests";

export default class FileEditor extends Component {
    constructor(props) {
        super(props);
        this.light_theme = "vs-light";
        this.dark_theme = "vs-dark";
        this.state = {
            selected_theme: this.light_theme,
            content: "",
            language: null,
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

    render() {
        return (
            <div className={`editor-container ${this.state.selected_theme === this.light_theme ? "light" : "dark"}`}>
                <div class="header">
                    {/* <select className="select-theme">
                    <option value={"light_theme"}>&#127774;</option>
                    <option value={"dark_theme"}>&#127769;</option>
                </select> */}
                </div>
                <Editor
                    height={"100%"}
                    width={"100%"}
                    defaultLanguage="txt"
                    defaultValue="// some comment"
                    theme={this.state.selected_theme}
                    value={this.state.content}
                    language={this.state.language}
                />
            </div>);
    }
}