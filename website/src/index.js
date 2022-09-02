import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Homepage from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Routes, Route } from "react-router-dom";

import Contact from './Components/Contact'

import About from './Components/About'

import Experiences from './Components/Experiences'

import WhoIAm from './Components/WhoIAm'

import WhatIDo from './Components/WhatIDo'

import ButtonAppBar from './Components/Shared/Header'


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
  <ButtonAppBar />
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