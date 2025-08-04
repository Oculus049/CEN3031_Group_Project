import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import ProtectedPage from './Protected';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/protected" element={<ProtectedPage />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
