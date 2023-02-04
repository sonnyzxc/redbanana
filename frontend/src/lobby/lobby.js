// import { useState, useEffect, React, Component} from 'react';
// import { Helmet } from 'react-helmet';
// import $ from 'jquery';
// import axios from 'axios';
// import {render} from "react-dom"

// import { API_URL } from '../constants';

// export default function lobby() {
// //   return (<h2>hello</h2>)
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCounter(console.log("load every 1 second"));
//         }, 1000);
//         return () => clearInterval(interval);
//     }, []);

//     useEffect(() => {
//         fetch('/getStatus')
//            .then((res) => res.json())
//            .then((data) => {
//               console.log(data);
//               setPosts(data);
//            })
//            .catch((err) => {
//               console.log(err.message);
//            });
//      }, []);


//     return (
//         <div className="App">
//             <h1>Counter: </h1>
//         </div>
//     )
// }

//     // var vname = "ChanYoun Lee"
//     // var vloginTime = 0;
//     // var vlines = 0;
//     // var vcommits = 0;
//     // var tasks = ["task1", "task2"]; var taskItems = tasks.map((task) => <li>{task}</li>)
//     // var comments = ["nice", ""];
//     // var collab = []; var collabItems = collab.map((c) => <li>{c}</li>)

//     // function displayLoginTime() {
//     // return <div dangerouslySetInnerHTML={{__html: 'Login Time: ' + loginTime}} />;
//     // }

//     // function displayName() {
//     // return <div dangerouslySetInnerHTML={{__html: 'Login Time: ' + name}} />;
//     // }

//     // function displayLines() {
//     // return <div dangerouslySetInnerHTML={{__html: 'Number of Lines: ' + lines}} />;
//     // }

//     // function displayTasks() {
//     // return <div dangerouslySetInnerHTML={<ul>{taskItems}</ul>} />;}
//     // }



