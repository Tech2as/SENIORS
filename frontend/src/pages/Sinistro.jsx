import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';
import Modal from "../components/template/Modal"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { useNavigate } from 'react-router-dom'
import * as yup from "yup";
import Axios from "axios"
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format, parse } from "date-fns";

const Sinistros = () => {

    const navigate = useNavigate();

     //codigo da renderizaçao dos sinistros
     const [sinistros, setSinistros] = useState([]);
     const [page, setPage] = useState(1);
     const [limit] = useState(5);
     const [total, setTotal] = useState(0);

    // Modal do abrir sinistro
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    //Modal do ver detalhes do sinistro
    const [showAModal, setshowAModal] = useState(false);
    const handleOpenAModal = () => setshowAModal(true);
    const handleCloseAModal = () => setshowAModal(false)

     //pegando do local storage
     const [userId, setUserId] = useState(null);
     const [userName, setUserName] = useState(null);
     const [loading, setLoading] = useState(true);

     //const para verificaçao de detalhes de cada sinistro
     const [idsinistro, setIdSinistro] = useState('');
     const [aviso, setAviso] = useState('');
     const [chassi, setChassi] = useState('');
     const [apolice, setApolice] = useState('');
     const [aon, setAon] = useState('');
     const [regulador, setRegulador] = useState('');
     const [data, setData] = useState('');
     const [observacoes, setObservacoes] = useState('');
     const [status, setStatus] = useState('')

     const estadoMap = {
        aberto: { label: 'PROCESSO ABERTO', color: 'green' },
        encerrado: { label: 'PROCESSO ENCERRADO', color: 'red' },
        pendente: { label: 'DOCUMENTOS PENDENTES', color: 'orange' },
        // Adicione outros estados conforme necessário
      };

    // POST pra gravar no banco de dados
const validationSchema = yup.object().shape({
    apolice: yup.string().required("Este campo é obrigatório"),
    aviso: yup.number().required("Este campo é obrigatório"),
    chassi: yup.string().required("Este campo é obrigatório"),
    data: yup.date().required("Este campo é obrigatório"),
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decodedToken = jwtDecode(token); // Decodifica o token

            if (decodedToken.id && decodedToken.nome) {
                setUserId(decodedToken.id); // Define o userId
                setUserName(decodedToken.nome); // Define o userName
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

useEffect(() => {
    if (!loading) {
        fetchSinistros();
    }
}, [page, loading])

const fetchSinistros = async () => {
    
    if (!userId) {
        console.error('userId não disponível');
        return; // Se o userId não estiver definido, não faça a requisição
    }
    try {
        const response = await Axios.get(`${process.env.REACT_APP_API_URL}/search-sinistros`, {
            params: { page, limit }
        });
        setSinistros(response.data.data);
        setTotal(response.data.total); // Atualiza o total de registros retornados
    } catch (error) {
        console.error("Erro ao buscar sinistros:", error);
    }
};

const handleSubmit = (values) => {
    Axios.post(`${process.env.REACT_APP_API_URL}/save-sinistro`, {
      apolice: values.apolice,
      status: values.status,
      aviso: values.aviso,
      chassi: values.chassi,
      aon: values.aon,
      regulador: values.regulador,
      data: values.data,
      observacoes: values.observacoes
    }).then((response) => {
        toast.success("Sinistro registrado!");
        window.location.reload(); // Força o recarregamento da página
    }).catch((error) => {
      console.error("Houve um erro", error);
    });
  };

//pegar o ID do sinistro
const handleClick = (event) => {
    const id = event.currentTarget.value;
    
    Axios.get(`${process.env.REACT_APP_API_URL}/get-sinistro?id=${id}`,)
        .then((response) => {
            const sin = response.data[0];  
            setIdSinistro(sin.id)
            setAviso(sin.aviso)
            setChassi(sin.chassi)
            setApolice(sin.apolice)
            setAon(sin.aon)
            setRegulador(sin.regulador)
            setData(sin.data)
            setObservacoes(sin.observacoes)
            setStatus(sin.estado)
            handleOpenAModal()
            })
            .catch((error) => {
                console.error('Erro ao fazer a solicitação GET:', error);
            });
    };

    return (
        <Main icon="car" title="Sinistros" >
            <div className="p-3">
            <ToastContainer /> 
            <div className="d-flex justify-content-between">
                <button className="btn btn-success" onClick={handleOpenModal}>
                    <i className="fa fa-plus-square px-2"></i>
                   Novo Sinistro
                </button>

            </div>

            <table className="table table-bordered mt-4" >
                <thead>
                    <tr>
                        <th>Número de Aviso</th>
                        <th>Chassi</th>
                        <th>Apólice</th>
                        <th>AON</th>
                        <th>Regulador</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                {sinistros.map((sinistro, index) => {
  const estado = estadoMap[sinistro.estado.toLowerCase()] || { label: sinistro.estado, color: 'transparent' };
  return (
    <tr key={index}>
      <td>{sinistro.aviso}</td>
      <td>{sinistro.chassi}</td>
      <td>{sinistro.apolice}</td>
      <td>{sinistro.aon}</td>
      <td>{sinistro.regulador}</td>
      <td>{new Date(sinistro.data).toLocaleDateString('pt-BR')}</td>
      <td>
        <span
          style={{
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '5px',
            backgroundColor: estado.color,
            color: 'white',
          }}
        >
          {estado.label}
        </span>
      </td>
      <td className="td-actions">
        <button
          className="btn btn-primary"
          value={sinistro.id}
          onClick={handleClick}
        >
          <i className="fa fa-eye"></i>
        </button>
        <button
          className="btn btn-warning"
        >
          <i className="fa fa-pencil-square-o"></i>
        </button>
      </td>
    </tr>
  );
})}

                </tbody>
            </table>
            <div className="d-flex justify-content-between">
                <button className="btn btn-danger" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Anterior
                </button>
                <span>Página {page}</span>
                <button className="btn btn-primary" disabled={total < limit} onClick={() => setPage(page + 1)}>
                    Próximo
                </button>
            </div>

            </div>
{/* Modal do Novo Sinistro */}
<Modal show={showModal} onClose={handleCloseModal}>
                <div className="modal-content2">
                    <Formik initialValues={{ regulador: userName}}  onSubmit={handleSubmit}
                        validationSchema={validationSchema}>
                        <Form action="">
                            <h2>Novo Sinistro</h2>
                            <div className="modal-inside">
                                <div className="form-group1">
                                    <label>Apólice:</label>
                                    <Field as="select" name="apolice">
                                        <option value="">Selecione uma apólice</option>
                                        <option value="PSA">PSA</option>
                                        <option value="IVECO">IVECO</option>
                                        <option value="CNH">CNH</option>
                                    </Field>
                                <ErrorMessage component="span" className="text-danger" name="apolice" />
                                </div>

                                <div className="form-group1">
                                    <label>Status do processo:</label>
                                    <Field as="select" name="status">
                                        <option value="">Selecione</option>
                                        <option value="aberto">Processo aberto</option>
                                        <option value="pendente">Documentos faltantes</option>
                                        <option value="encerrado">Processo encerrado</option>
                                    </Field>
                                <ErrorMessage component="span" className="text-danger" name="status" />
                                </div>

                                <div className="form-group1">
                                    <label>Número de aviso:</label>
                                    <Field name="aviso"
                                        type="number"
                                    />
                                    <ErrorMessage component="span" className="text-danger" name="aviso" />
                                </div>

                                <div className="form-group1">
                                    <label>Chassi:</label>
                                    <Field name="chassi"
                                        type="text"
                                    />
                                    <ErrorMessage component="span" className="text-danger" name="chassi" />
                                </div>

                                <div className="form-group1">
                                    <label>AON:</label>
                                    <Field name="aon"
                                        type="text"
                                    />
                                    <ErrorMessage component="span" className="text-danger" name="aon" />
                                </div>

                                <div className="form-group1">
                                    <label>Data:</label>
                                    <Field name="data"
                                        type="date"
                                    />
                                    <ErrorMessage component="span" className="text-danger" name="data" />
                                </div>

                                <div className="form-group1">
                                    <label>Regulador:</label>
                                    <Field name="regulador"
                                        type="text" value={userName} disabled
                                    />
                                    <ErrorMessage component="span" className="text-danger" name="regulador" />
                                </div>

                                <div className="form-group1">
                                    <label htmlFor="observacoes">Observações:</label>
                                    <Field
                                        as="textarea"
                                        id="observacoes"
                                        name="observacoes"
                                        className="form-control"
                                    />
                                    <ErrorMessage component="span" className="text-danger" name="observacoes" />
                                </div>

                                <Field name="userid"  hidden />
                                <Field name="username"  hidden />

                                <button type="submit" className="btn btn-success">Salvar</button>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </Modal>

{/* Modal do Ver Detalhes sinistro */}
<Modal show={showAModal} onClose={handleCloseAModal}>
                <div className="modal-content2">
                    <Formik initialValues={{ idsinistro: idsinistro, 
                        aviso: aviso,
                        chassi: chassi,
                        apolice: apolice,
                        aon: aon,
                        regulador: regulador,
                        data: new Date(data).toLocaleDateString('pt-BR'),
                        observacoes: observacoes,
                        status: status
                    }}
                        >
                        <Form action="">
                            <h2>Detalhes do sinistro</h2>
                            <div className="modal-inside">
                                <div className="form-group1">
                                    <label>Apólice:</label>
                                    <Field type="text" name="apolice" disabled>
                                    </Field>
                                </div>

                                <div className="form-group1">
                                    <label>Status do processo:</label>
                                    <Field name="status" disabled/>
                                </div>

                                <div className="form-group1">
                                    <label>Número de aviso:</label>
                                    <Field name="aviso"
                                        type="number" disabled
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>Chassi:</label>
                                    <Field name="chassi"
                                        type="text" disabled
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>AON:</label>
                                    <Field name="aon"
                                        type="text" disabled
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>Regulador:</label>
                                    <Field name="regulador"
                                        type="text" disabled
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>Data:</label>
                                    <Field name="data"
                                        type="text" disabled
                                    />
                                </div>

                                <div className="form-group1">
                                    <label htmlFor="observacoes">Observações:</label>
                                    <Field
                                        as="textarea"
                                        id="observacoes"
                                        name="observacoes"
                                        className="form-control" disabled
                                    />
                                </div>
                                <button onClick={handleCloseAModal} type="button" className="btn btn-primary">Ok</button>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </Modal>

        </Main>
    );
};

export default Sinistros