import './App.css';
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        Welcome to my website!
        <p>
          Still in development!
        </p>
        <div>
          <Link to="/">Home</Link>
          <Link to="/AboutMe">About</Link>
        </div> 
      </header>
    </div>
  );
}

export default App;