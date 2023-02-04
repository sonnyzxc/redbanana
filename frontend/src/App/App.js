import './App.css';

function setToken(userToken) {
  // sessionStorage.setItem('token', JSON.stringify(userToken));
}

function getToken() {}

function App() {
  return (
    <div className="container">
      <form action="/action_page.js">
        <div style={{textAlign:"center"}} className="row">
          <h2>Login</h2>

          <input type="text" name="username" placeholder="Username" required/>
          <br></br>
          <input type="password" name="password" placeholder="Password" required/>
          <br></br>
          <br></br>
          <input type="submit" value="Login"/>
        </div>
      </form>
    </div>
  );
}

export default App;
