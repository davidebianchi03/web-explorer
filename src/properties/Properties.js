import Swal from "sweetalert2";
import { GetPathProperties } from "../http-requests/http-requests";
import "./Properties.css";
import { Component, } from "react";

export default class Properties extends Component {
    constructor(props) {
        super(props);
        this.path = props.path;
        this.state = {
            filename: "",
            path: "",
            size: "",
            permissions: "",
            creation_date: "",
            modified_on: ""
        }
    }

    componentDidMount() {
        (async () => {
            let response = await GetPathProperties(this.path);
            if (response.error) {
                Swal.fire(
                    "Cannot load properties",
                    response.data.response.data.message ? response.data.response.data.message : response.data.message,
                    "error"
                );
                return;
            }

            this.setState({
                filename: response.data.filename,
                path: response.data.path,

            });
            console.log(response.data)
        })();
    }

    render() {
        return (
            <div className="properties">
                <div className="file-info">
                    <span>Filename</span>
                    <input type="text" value={this.state.filename} onChange={(value) => { this.setState({ filename: value }) }} />
                </div>
                <table className="properties-table">
                    <tbody>
                        <tr>
                            <td>Path</td>
                            <td>{this.state.path}</td>
                        </tr>
                        <tr>
                            <td>Size</td>
                            <td>{this.state.size}</td>
                        </tr>
                        <tr>
                            <td>Permissions</td>
                            <td>{this.state.permissions}</td>
                        </tr>
                        <tr>
                            <td>Creation date</td>
                            <td>{this.state.creation_date}</td>
                        </tr>
                        <tr>
                            <td>Modified on</td>
                            <td>{this.state.modified_on}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="buttons">
                    <button>
                        OK
                    </button>
                    <button>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }
}