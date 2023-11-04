import MonacoEditor from 'react-monaco-editor';
import { Component } from "react";

export default class FileEditor extends Component{

    constructor(props){
        super(props);
    }
    
    render(){
        return(
            <MonacoEditor
                width="800"
                height="600"
                language="javascript"
                theme="vs-dark"
            />
        )
    }
}