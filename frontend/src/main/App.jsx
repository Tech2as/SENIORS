import React from "react";
import './App.css'
import 'font-awesome/css/font-awesome.min.css'
import { useState, useEffect } from "react"
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from "../pages/Home"
import Footer from "../components/template/Footer"
import Logo from "../components/template/Logo"
import Nav from "../components/template/Nav"
import Sinistros from "../pages/Atendimento";
import Consultas from "../pages/Consultas";
import Profissionais from "../pages/Profissionais";
import Login from "../auth/Login";
import Cadastro from "../auth/Cadastro";
import PrivateRoute from "../auth/Private";
import Conta from "../pages/Conta";

const App = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Se já tem um token, você pode obter a função do usuário aqui também, caso queira.
    }
  }, []);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role); // Atualiza a função do usuário
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Tem certeza de que deseja deslogar?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserRole(null); // Limpa a função do usuário ao deslogar
    }
  };

  const handleSignup = (userData) => {
    setIsAuthenticated(true);
    setUserRole(userData.funcao);  // A função do usuário é acessada a partir de 'userData.funcao'
    localStorage.setItem('user', JSON.stringify(userData));  // Armazena todos os dados do usuário no localStorage
    window.location.href = '/';
};
  

  return (
    <BrowserRouter>
    {!isAuthenticated ? (
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/cadastro" element={<Cadastro onSignup={handleSignup} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    ) : (
      <div className="app">
        <Logo />
        <Nav onLogout={handleLogout} userRole={userRole} /> {/* Passa userRole para o Nav */}
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/sinistros" element={<PrivateRoute element={Sinistros} />} />
          <Route path="/consultas" element={<PrivateRoute element={Consultas} />} />
          <Route path="/conta" element={<PrivateRoute element={Conta} />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
        <Footer />
      </div>
    )}
  </BrowserRouter>
  );
}

export default App;