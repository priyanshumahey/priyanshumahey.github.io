import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Routes, Route } from "react-router-dom";

function About () {
  return(
    <p>About Component</p>
  )
}

function Contact () {
  return(
    <p>Contact Component</p>
  )
}

function Experiences () {
  return(
    <p>Experiences Component</p>
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
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/AboutMe" element={<About />} />
      <Route path="/Experiences" element={<Experiences />} />
      <Route path="/Contact" element={<Contact />} />
    </Routes>
  </HashRouter>

);


reportWebVitals();