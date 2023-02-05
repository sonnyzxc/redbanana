import { useState, useEffect, React, Component} from 'react';
import { Helmet } from 'react-helmet';
import $ from 'jquery';
import axios from 'axios';
import {render} from "react-dom"

import { API_URL } from '../constants';

// export default function lobby() {
// //   return (<h2>hello</h2>)
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCounter(console.log("load every 1 second"));
//         }, 1000);
//         return () => clearInterval(interval);
//     }, []);

//     var 

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

    // var vname = "ChanYoun Lee"
    // var vloginTime = 0;
    // var vlines = 0;
    // var vcommits = 0;
    // var tasks = ["task1", "task2"]; var taskItems = tasks.map((task) => <li>{task}</li>)
    // var comments = ["nice", ""];
    // var collab = []; var collabItems = collab.map((c) => <li>{c}</li>)

    // function displayLoginTime() {
    // return <div dangerouslySetInnerHTML={{__html: 'Login Time: ' + loginTime}} />;
    // }

    // function displayName() {
    // return <div dangerouslySetInnerHTML={{__html: 'Login Time: ' + name}} />;
    // }

    // function displayLines() {
    // return <div dangerouslySetInnerHTML={{__html: 'Number of Lines: ' + lines}} />;
    // }

    // function displayTasks() {
    // return <div dangerouslySetInnerHTML={<ul>{taskItems}</ul>} />;}
    // }




// class Lobby extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       data: [],
//       loaded: false,
//       placeholder: "Loading"
//     };
//   }

//   componentDidMount() {
//     fetch(API_URL)
//       .then(response => {
//         if (response.status > 400) {
//           return this.setState(() => {
//             return { placeholder: "Something went wrong!" };
//           });
//         }
//         return response.json();
//       })
//       .then(data => {
//         this.setState(() => {
//           return {
//             data,
//             loaded: true
//           };
//         });
//       });
//   }

//   render() {
//     return (
//       <ul>
//         {this.state.data.map(employee => {
//           return (
//             <li key={employee.id}>
//               {employee.employee_name} - {employee}}
//             </li>
//           );
//         })}
//       </ul>
//     );
//   }
// }

// export default Lobby;

// const container = document.getElementById("app");
// render(<Lobby />, container);