// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LearningPage from "../../src/pages/Learning";
import "../src/index.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LearningPage />} />
      </Routes>
    </Router>
  );
}
