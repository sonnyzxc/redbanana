import React from 'react';
import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Route, Switch } from 'react-router-dom'; 
import './index.css';
import Login from './App/Login.js';
import Lobby from './Lobby/Lobby.js';
import reportWebVitals from './reportWebVitals';

// function App() {
//   return (
//     <div className="wrapper">

//     </div>

//   )
// }

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <Lobby /> */}
    <Login />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
