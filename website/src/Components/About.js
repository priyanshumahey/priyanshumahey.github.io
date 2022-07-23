import { Link } from "react-router-dom";

//---Website Structure
//|Homepage
//|About Me
//|--Who I Am
//|--What I Do
//|Experiences
//|Contact Me

//This page leads to WhatIAm and WhatIDO

function About () {
    return(
      <div>
        <p>About Component</p>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/WhoIAm">Who I Am</Link>
        </li>
        <li>
          <Link to="/WhatIDo">What I Do</Link>
        </li>
    </div> 
    )
  }

export default About;