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
        <h3>About Component</h3>
        <p>I am Priyanshu, a 4th year integrated sciences student with many passions.</p>
        <p>To learn more about me, visit the following links!</p>
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