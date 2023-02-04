import './Login.css';
import React from 'react';  
// import { useHistory } from 'react-router-dom';
// import { Router, useNavigate } from 'react-router-dom';

export default function Login() {
  // const usernameRef = useRef();
  // const passwordRef = useRef();

  // function sendBackend() {
  //   sendCredentials(usernameRef.current.value, passwordRef.current.value);
  // }
  // const navigate = useNavigate();

  // function handleClick() {
  //   navigate('../Lobby/Lobby.js');
  // }

  return (
    <div className="container">
      <form action="/auth.js">
        <div style={{textAlign:"center"}} className="row">
        {/* <Router> */}
          <h2>Login</h2>          
          <input type="text" name="username" placeholder="Username" required/>
          <br></br>
          <input type="password" name="password" placeholder="Password" required/>
          <br></br>
          <br></br>
          {/* <input onSubmit={routeChange} type="submit" value="Login"/> */}
            {/* <button onClick={handleClick} value="Login">Login</button> */}
            <a href="../Lobby/Lobby.js">Login</a>
          {/* </Router> */}
          {/* <Link to="/lobby" type="submit" value="Login"/> */}
        </div>
      </form>
    </div>
  );


// function sendCredentials(username, password) {
//   const requestOptions = {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ username, password })
//   };

//   fetch('/login', requestOptions)
//     .then(response => response.json())
//     .then(data => {
//       if (data.success) {
//         window.location = '/lobby'; // redirect to lobby page if credentials are correct 
//       } else {
//         alert('Incorrect username or password'); // show error message if credentials are incorrect 
//       }  
//     });  
//   }
} 


// q: in 