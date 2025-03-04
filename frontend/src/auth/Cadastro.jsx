import { Link } from 'react-router-dom'
import { useState } from 'react'
import React from 'react'
import { Formik, Form, Field, ErrorMessage} from "formik"
import * as yup from "yup"
import Axios from "axios"
import { ToastContainer, toast } from 'react-toastify';

const Cadastro = ({ onSignup }) => {
    const handleSignupClick = (values) => {
        Axios.post(`${process.env.REACT_APP_API_URL}/registro`, {
          nome: values.nome,
          funcao: values.funcao,
          email: values.email,
          senha: values.senha
        }).then((response) => {
          if (response.data.success) {
            onSignup();
            toast.success("Usuário criado com sucesso!");
          } else {
            alert("Cadastro falhou, por favor, tente novamente");
          }
        }).catch((error) => {
          console.error("Houve um erro durante o cadastro:", error);
        });
      };
    
      const validationRegister = yup.object().shape({
        nome: yup.string().required("Este campo é obrigatório"),
        funcao: yup.string().required("Este campo é obrigatório"),
        email: yup.string().email("Não é um email válido").required("Este campo é obrigatório"),
        senha: yup.string().min(5, "A senha deve ter pelo menos 5 caracteres").required("Este campo é obrigatório")
      });
    return(
        <div className="d-flex justify-content-center align-items-center bg-danger vh-100">
        <div className="bg-white p-3 rounded w-25">
        <ToastContainer /> 
        <Formik initialValues={{}} onSubmit={handleSignupClick}
            validationSchema={validationRegister}> 
            <Form action="" >
                <h2 className="d-flex justify-content-center align-items-center">Sistema de Cadastro</h2>
                <div className="mb-3">
                    <label htmlFor="nome">Nome</label>
                    <Field type="nome" placeholder="Insira seu nome" className="form-control rounded-0" name="nome"/>
                    <ErrorMessage component="span" className="text-danger" name="nome"/>
                </div>

                <div className="mb-3">
                    <label htmlFor="funcao">Você é?</label>
                    <Field as="select" className="form-control rounded-0" name="funcao">
                        <option value="" label="Selecione..." />
                        <option value="psicologo" label="Psicólogo" />
                        <option value="paciente" label="Paciente" />
                    </Field>
                    <ErrorMessage component="span" className="text-danger" name="select"/>
                </div>

                <div className="mb-3">
                    <label htmlFor="email">Email</label>
                    <Field type="email" placeholder="Insira seu email" className="form-control rounded-0" name="email"/>
                    <ErrorMessage component="span" className="text-danger" name="email"/>
                </div>
                <div className="mb-3">
                    <label htmlFor="senha">Senha</label>
                    <Field type="password" placeholder="Insira sua senha" className="form-control rounded-0" name="senha"/>
                    <ErrorMessage component="span" className="text-danger" name="senha"/>
                </div>
                <div>
                    <button type="submit" className="btn btn-success w-100 mb-2">Cadastrar</button>
                    <Link to="/" className="btn btn-default border w-100 text-decoration-none">Login</Link>
                </div>
            </Form>
        </Formik>
        </div>
    </div>
    )
}

export default Cadastro