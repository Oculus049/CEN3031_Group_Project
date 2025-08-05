import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import HomePage from './HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/login" />} /> {/* Redirect root to /login */}
        <Route path="*" element={<div>404 Not Found</div>} /> {/* Fallback for unknown routes */}
      </Routes>
    </Router>
  );
}

export default App;
