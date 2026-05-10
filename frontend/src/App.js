import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <h1>Arriendos360</h1>
        <Routes>
          <Route path="/" element={<h2>Bienvenido al Dashboard</h2>} />
          <Route path="/login" element={<h2>Login</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
