import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Enables routing (moving between pages like /home, /login)
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";

const store = configureStore({
  reducer: rootReducer,
});


// Render the React app inside the root
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
     {/* Enables extra checks in development mode */}

     {/* Redux store provider (fix for useSelector/useDispatch error) */}
    <Provider store={store}>
      {/* Enables routing (navigation between pages without reload) */}
      <BrowserRouter>
        {/* Main App component (everything starts from here) */}
        <App />

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>

  </React.StrictMode>
);