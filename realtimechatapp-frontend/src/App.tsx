import "./App.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/chat/:userName" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
  );
};

export default App;