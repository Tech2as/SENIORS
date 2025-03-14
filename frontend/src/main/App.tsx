import React from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import { useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Home from "../pages/Home";
import Footer from "../components/template/Footer";
import Logo from "../components/template/Logo";
import Nav from "../components/template/Nav";
import Sinistros from "../pages/Sinistro";
import Login from "../auth/Login";
import Cadastro from "../auth/Cadastro";
import PrivateRoute from "../auth/Private";
import Conta from "../pages/Conta";

// Definindo interfaces para melhorar a tipagem
interface UserData {
  funcao: string;
  // adicione outros campos conforme necessário
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Tem certeza de que deseja deslogar?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserRole(null);
      navigate('/');
    }
  };

  // Defina a função como uma expressão de tipo para corresponder ao esperado pelo componente Cadastro
  // Se Cadastro espera uma função sem argumentos, podemos adaptar nossa implementação
  const handleSignup: () => void = () => {
    // Assumindo que o componente Cadastro gerencia internamente os dados do usuário
    // e não os passa para esta função
    setIsAuthenticated(true);
    // Como não temos acesso aos dados do usuário aqui, definimos um valor padrão
    setUserRole("user"); // ou qualquer valor padrão apropriado
    navigate('/');
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
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/sinistros" element={<PrivateRoute element={Sinistros} />} />
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