import { Link } from 'react-router-dom';
import { useState } from 'react';
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import Axios from "axios";

function Login({ onLogin }) {

  const handleSubmit = (values, { resetForm }) => {
    Axios.post("http://localhost:3002/login", {
      email: values.email,
      senha: values.senha,
    }).then((response) => {
      if (response.data.auth) {
        // Armazena o token no localStorage
        localStorage.setItem("token", response.data.token);

        // Aqui você obtém a função do usuário da resposta
        const userRole = response.data.user?.funcao || "desconhecido"; // Valor default se não encontrar 'funcao'

        // Passa a função do usuário para o componente pai (App.jsx)
        onLogin(userRole); // Atualiza o estado de 'userRole' no App.jsx
      } else {
        alert("Login falhou, por favor, verifique suas credenciais");
      }
    }).catch((error) => {
      console.error("Houve um erro durante o login:", error);
      alert("Login falhou, por favor, verifique suas credenciais");
      resetForm();
    });
  };

  const validationSchema = yup.object().shape({
    email: yup.string().email("Não é um email válido").required("Este campo é obrigatório"),
    senha: yup.string().min(5, "A senha deve ter pelo menos 5 caracteres").required("Este campo é obrigatório")
  });

  return (
    <div className="d-flex justify-content-center align-items-center bg-danger vh-100">
      <div className="bg-white p-3 rounded w-25">
        <h2 className="d-flex justify-content-center align-items-center">Sistema de Login</h2>
        <Formik initialValues={{ email: '', senha: '' }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
        >
          <Form action="">
            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <Field type="email" placeholder="Insira seu email" className="form-control rounded-0" name="email" />
              <ErrorMessage component="span" className="text-danger" name="email" />
            </div>
            <div className="mb-3">
              <label htmlFor="senha">Senha</label>
              <Field type="password" placeholder="Insira sua senha" className="form-control rounded-0" name="senha" />
              <ErrorMessage component="span" className="text-danger" name="senha" />
            </div>
            <div className="m-10">
              <button type="submit" className="btn btn-success w-100 mb-2">Login</button>
              <Link to="/cadastro" className="btn btn-default border w-100 text-decoration-none">Cadastre-se</Link>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default Login;