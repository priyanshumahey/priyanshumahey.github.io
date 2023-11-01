---
title: "MUSE Pet"
excerpt: "A virtual pet that repsonds to your brain waves<br/>SWE, DL"
collection: portfolio
---

# MUSE-Pet

## Overview

MUSE Pet is a virtual simulator where the health of the pet is affected by the user's mental state. The MUSE headset is used to collect user EEG data, and real time signal processing predicts the user's attentiveness to display on a web app interface.  

![Web App Home](images/WebAppHome.png)

![Login/Registration](images/LoginRegistration.png)

![Pet Selection](images/PetSelection.png)

![Update Pet](images/UpdatePet.png)

## Hardware

The hardware used for this project is the MUSE headset. The MUSE headset is a consumer grade EEG headset that is used to collect EEG data.

![MUSE](/Images/MuseHeadsetDiagram.jpg)

## Software Architecture

The software architecture below demonstrates how the MERN stack communicates with the external signal processing tool via HTTP APIs. The external tool collects EEG data from the MUSE headset worn by the user, and the data is processed by the signal processing script, which transforms the data into numeric values based on the user's attentiveness. The processed data is sent to the web server, which updates the information in the MongoDB database in real time.

The attentiveness values are then sent to the web app via HTTP APIs using Axios. The web app displays the user's attentiveness and the pet's health.

![Software Architecture](/Images/SoftwareArchitecture.png)

The frontend layer consists of React.js and Axios, which is a HTTP client library for making requests from the frontend to the backend.

The backend layer consists of Node.js and Express.js, and an HTTP API that can receive requests from external tools. The Python script that communicates with the backend via POST requests.

The Python script uses the requests library to send POST requests to the HTTP API provided by the backend. The backend processes the request and performs any necessary actions (such as interacting with the database layer).



## Built With

* [MUSE SDK](http://developer.choosemuse.com/) - EEG headset software development kit
* [MongoDB](https://www.mongodb.com/) - The database used
* [Express](https://expressjs.com/) - Backend framework
* [React](https://reactjs.org/) - Frontend framework
* [Node.js](https://nodejs.org/en/) - JavaScript runtime
* [Python](https://www.python.org/) - Signal processing language
  