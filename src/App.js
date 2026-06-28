import "./App.css";
import {Route, Routes } from "react-router-dom";
import Home from "./pages/Home"

function App() {
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">

     {/* Routes define which page/component shows for which URL */}
    <Routes>
       {/* When user visits "/", show Home page */}
      <Route path="/" element={<Home/>} />
      
    </Routes>
   </div>
  );
}

export default App;
