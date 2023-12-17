import './App.css';
import './fonts.css';
import FileExplorer from './components/fileexplorer/FileExplorer';

function App() {
  return (
    <div className="App">
      <FileExplorer initialPath={""}/>
    </div>
  );
}

export default App;
