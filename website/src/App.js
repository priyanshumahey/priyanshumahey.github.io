import './App.css';
import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div className="App">
      <header className="App-header">
        Welcome to my website!
        <p>
          Still in development!
        </p>
        <div>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/AboutMe">About</Link>
          </li>
        </div> 
      </header>
    </div>
  );
}

export default Homepage;