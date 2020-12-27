import React, { useEffect } from "react";
import { greetingStub } from "./api/greeting";
import logo from "./logo.svg";
import "./App.css";

function App() {
  useEffect(() => {
    (async () => {
      const res = await greetingStub.greeting({});
      console.log(JSON.stringify(res))
    })();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
