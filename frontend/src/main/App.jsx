import React from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import { useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'; // Importe o useNavigate
import Home from "../pages/Home";
import Footer from "../components/template/Footer";
import Logo from "../components/template/Logo";
import Nav from "../components/template/Nav";
import Sinistros from "../pages/Sinistro";
import Consultas from "../pages/Consultas";
import Login from "../auth/Login";
import Cadastro from "../auth/Cadastro";
import PrivateRoute from "../auth/Private";
import Conta from "../pages/Conta";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate(); // Inicialize o hook useNavigate

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Tem certeza de que deseja deslogar?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/'); // Navegação para a página de login
    }
  };

  const handleSignup = (userData) => {
    setIsAuthenticated(true);
    setUserRole(userData.funcao);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/'); // Navegação para a página de login após cadastro
  };

  return (
<div className={`app ${!isAuthenticated ? "login-layout" : ""}`}>

{isAuthenticated && (
        <>
          <Logo />
          <Nav onLogout={handleLogout} userRole={userRole} />
        </>
      )}
      
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/cadastro" element={<Cadastro onSignup={handleSignup} />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </>
        ) : (
          <>
          
            <Route path="/home" element={<Home />} />
            <Route path="/sinistros" element={<PrivateRoute element={Sinistros} />} />
            <Route path="/consultas" element={<PrivateRoute element={Consultas} />} />
            <Route path="/conta" element={<PrivateRoute element={Conta} />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </>
        )}
      </Routes>
  
      {isAuthenticated && <Footer />}
    </div>
  );
  
};

export default App;