import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Axios from "axios";
import { ToastContainer, toast } from 'react-toastify';

const Conta = () => {
    const navigate = useNavigate();

    const [id, setId] = useState(null);
    const [clientes, setClientes] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Efeito para decodificar o token e pegar os dados do usuário
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token); // Decodifica o token
                if (decodedToken.id) {
                    setUserId(decodedToken.id); // Define o userId
                    setLoading(false);  // Dados carregados com sucesso
                } else {
                    console.error('Dados do token inválidos:', decodedToken);
                    navigate('/login'); // Redireciona se os dados estiverem ausentes ou inválidos
                }
            } catch (error) {
                console.error('Erro ao decodificar o token:', error);
                navigate('/login'); // Redireciona se o token for inválido
            }
        } else {
            navigate('/login'); // Redireciona se não houver token
        }
    }, [navigate]);

    // Efeito para carregar os dados do cliente
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redireciona para login caso o token não exista
        }
        if (userId && !loading) {
            fetchClientes();
        }
    }, [navigate,userId, loading]); // Só chama o fetch quando o userId estiver disponível

    // Função para buscar os dados do cliente
    const fetchClientes = async () => {
        try {
            setLoading(true); // Marca como carregando antes de fazer a requisição
            const res = await Axios.get('http://localhost:3002/search-conta', {
                params: { userId }
            });

            if (res.data) {
                const data = res.data.data;
                setId(data.id);
                setClientes(data.nome || 'Nome não disponível');
                setEmail(data.email || 'Email não disponível');
                setSenha(data.senha || 'Senha não disponível');
            } else {
                console.error('Dados não encontrados para o usuário.');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do cliente:', error);
        } finally {
            setLoading(false); // Finaliza o carregamento independentemente do sucesso ou erro
        }
    };

//Salvar os dados
    const handleSubmit = (values) => {
        Axios.post("http://localhost:3002/save-conta", {
          id: values.id,
          nome: values.nome,
          email: values.email,
          senha: values.password
        }).then((response) => {
            toast.success("Salvo com sucesso!");
            setTimeout(() => {
              navigate('/home');
            }, 1000); // Aguarda 1 segundos antes de navegar
        }).catch((error) => {
          console.error("Houve um erro", error);
        });
      };

// Excluir conta

const handleDeleteAccount = (id, navigate) => {
    if (window.confirm("Tem certeza de que deseja excluir sua conta? Esta ação é irreversível!")) {
        Axios.delete("http://localhost:3002/delete-conta", { data: { id } })
            .then(() => {
                // Remover dados de autenticação (como o token) do localStorage
                localStorage.clear();
                window.location.reload(); // Força o recarregamento da página
                toast.success("Conta excluída com sucesso!");
            })
            .catch((error) => {
                console.error("Erro ao excluir conta:", error);
                toast.error("Erro ao excluir conta.");
            });
    }
};
    return (
        <Main icon="home" title="Conta">
            <ToastContainer /> 
                <div className="p-3">
                <div className="container-new">
                <div className="content-new">
                <Formik
                    enableReinitialize
                    initialValues={{
                        id: id,
                        nome: clientes,   // Usando o estado carregado
                        email: email,     // Usando o estado carregado
                        password: senha   // Usando o estado carregado
                    }}
                    onSubmit={handleSubmit}
                >
                  
        {({ values }) => (
        <Form className="form-profile">
            <label>Nome:</label>
            <Field name="nome" type="text" />
            <ErrorMessage component="span" className="text-danger" name="nome" />

            <label>E-mail:</label>
            <Field name="email" type="text" />
            <ErrorMessage component="span" className="text-danger" name="email" />

            <label>Senha:</label>
            <Field name="password" type="password" />
            <ErrorMessage component="span" className="text-danger" name="password" />

            <Field name="id" hidden />

            <button type="submit" className="btn btn-success">Salvar</button>
            <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDeleteAccount(values.id, navigate)}
            >
                Excluir conta
            </button>
        </Form>
            )}
                </Formik>
                </div>
                </div>
                </div>
        </Main>
    );
};

export default Conta;
