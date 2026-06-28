import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Enables routing (moving between pages like /home, /login)
import { BrowserRouter } from "react-router-dom";

// Render the React app inside the root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
     {/* Enables extra checks in development mode */}

     {/* Enables routing (navigation between pages without reload) */}
    <BrowserRouter>
      {/* Main App component (everything starts from here) */}
      <App />
    </BrowserRouter>
    
  </React.StrictMode>
);