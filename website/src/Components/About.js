import { Link } from "react-router-dom";


function About () {
    return(
      <div>
        <p>About Component</p>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/AboutMe">About</Link>
        </li>
    </div> 
    )
  }

export default About;