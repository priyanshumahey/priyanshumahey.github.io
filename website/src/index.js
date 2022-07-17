import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Homepage from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Routes, Route, Link } from "react-router-dom";

import Contact from './Components/Contact'

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


function Experiences () {
  return(
    <p>Experiences Component</p>
  )
}

function WhoIAm () {
  return(
    <p>WhoIAm Component</p>
  )
}

function WhatIDo () {
  return(
    <p>WhatIDo Component</p>
  )
}

//---Website Structure
//|Homepage
//|About Me
//|--Who I Am
//|--What I Do
//|Experiences
//|Contact Me

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <> 
    <HashRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/AboutMe" element={<About />} />
        <Route path="/WhoIAm" element={<WhoIAm />} />
        <Route path="/WhatIDo" element={<WhatIDo />} />
        <Route path="/Experiences" element={<Experiences />} />
        <Route path="/Contact" element={<Contact />} />
      </Routes>
    </HashRouter>
  </>
);


reportWebVitals();