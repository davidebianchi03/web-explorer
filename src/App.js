import './App.css';
import 'winbox/dist/css/winbox.min.css'; // required
import WinBox from 'react-winbox';
import React from 'react';
import folder_icon from "./img/folder.svg";
import { GetConnectionsList } from './http-requests/http-requests';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      connections: []
    }
  }

  componentDidMount() {
    (async() => {
      let server_connections = GetConnectionsList();
    })();
    // let connections = [];
    // for(let i=0;i<20;i++){
    //   connections.push(
    //       <li className='connection'>
    //         <img src={folder_icon} alt='Folder'/>
    //         <span>Connection Name</span>
    //       </li>
    //   )
    // }
    // this.setState({connections:connections})
  }

  render() {
    return (
      <div className='app'>
        <ul className='connections'>
          {this.state.connections}
        </ul>
      </div>
    )
  }
}


// function App() {
//   return (
//     <div className="App">
//       <div>
//         {/* <WinBox
//           width={500}
//           height={300}
//           x="center"
//           y={30}
//           title='Pippo'
//           bottom={0}
//           className='modern'
//           background= "#ff005d"
//           noFull={true}
//         >
//           <p>Pippo</p>
//         </WinBox>
//         <WinBox
//           width={500}
//           height={300}
//           x="center"
//           y={30}
//           title='Pippo2'
//           noFull={true}
//         >
//           <p>Pippo2</p>
//         </WinBox> */}
//       </div>
//     </div>
//   );
// }

// export default App;
