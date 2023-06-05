import './App.css';
import 'winbox/dist/css/winbox.min.css'; // required
import WinBox from 'react-winbox';

function App() {
  return (
    <div className="App">
      <div style={{ margin: 10 }}>
        <WinBox
          width={500}
          height={300}
          x="center"
          y={30}
          title='Pippo'
          // noClose={this.state.inEditing}
          bottom={40}
        >
          <p>Pippo</p>
        </WinBox>
        <WinBox
          width={500}
          height={300}
          x="center"
          y={30}
          title='Pippo2'
        // noClose={this.state.inEditing}
        >
          <p>Pippo2</p>
        </WinBox>
      </div>
    </div>
  );
}

export default App;
