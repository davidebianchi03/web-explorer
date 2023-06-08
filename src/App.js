import './App.css';
import 'winbox/dist/css/winbox.min.css'; // required
import WinBox from 'react-winbox';
import React from 'react';
import folder_icon from "./img/folder.svg";
import { GetConnectionsList } from './http-requests/http-requests';
import { FileExplorer } from './file-explorer/FileExplorer';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connections: [],
      windows: [],
    }
  }

  componentDidMount() {
    (async () => {
      let response = await GetConnectionsList();
      if (!response.error) {
        let connections = [];
        for (let i = 0; i < response.data.length; i++) {
          let connection = response.data[i];
          connections.push(
            <li className='connection' onDoubleClick={() => this.openConnection(connection)} key={connection.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={folder_icon} alt='Folder' />
                <span>{connection.name}</span>
              </div>
            </li>
          );
        }
        this.setState({ connections: connections })
      } else {
        // TODO: print error
      }
    })();
  }

  render() {
    return (
      <div className='app'>
        {this.state.windows}
        <ul className='connections'>
          {this.state.connections}
        </ul>
      </div>
    )
  }

  openConnection(connection) {
    let connections = this.state.connections;
    let window_title = `[${connection.name}] - ${connection.path === '' ? '/' : connection.path}`;
    connections.push(
      <WinBox
        width={500}
        height={300}
        x="center"
        y={30}
        title={window_title}
        bottom={0}
        className='modern'
        background="#ff5100"
        noFull={true}
      >
        <FileExplorer connection={connection} />
      </WinBox>
    );
    this.setState({ connections: connections });
  }
}