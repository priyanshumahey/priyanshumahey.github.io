import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

//Website Structure


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/AboutMe" element={<About />} />
      <Route path="/Experiences" element={<Experiences />} />
      <Route path="/Contact" element={<Contact />} />
    </Routes>
  </BrowserRouter>

);


reportWebVitals();