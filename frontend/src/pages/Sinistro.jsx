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

import VerSinistrosDetalhes from "../components/modals/VerDetalhesSinistro";
import EditarSinistros from '../components/modals/EditarSinistros';


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

    //Modal global
    const [sinistroSelecionado, setSinistroSelecionado] = useState(null);

    //Modal do ver detalhes do sinistro
    const [showAModal, setshowAModal] = useState(false);
    const handleOpenAModal = () => setshowAModal(true);
    const handleCloseAModal = () => setshowAModal(false);

    //Modal do editar sinistro
    const [showEModal, setshowEModal] = useState(false);
    const handleOpenEModal = () => setshowEModal(true);
    const handleCloseEModal = () => setshowEModal(false)

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
    
    const token = localStorage.getItem('token'); 
    if (!token) {
        console.error('Token não disponível');
        return;
    }

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

//salvar os dados do novo sinistro
const handleSubmit = (values, { setSubmitting }) => {
    Axios.post(`${process.env.REACT_APP_API_URL}/save-sinistro`, {
        apolice: values.apolice,
        status: values.status,
        aviso: values.aviso,
        chassi: values.chassi,
        aon: values.aon,
        regulador: values.regulador,
        data: values.data,
        observacoes: values.observacoes
    })
    .then(() => {
        toast.success("Sinistro registrado com sucesso!");
        handleCloseModal();
    })
    .catch((error) => {
        if (error.response) {
            if (error.response.status === 409) {
                toast.error("Já existe um sinistro cadastrado com este número de aviso ou chassi!");
            } else {
                toast.error("Erro ao registrar o sinistro. Tente novamente.");
            }
        } else {
            console.error("Erro inesperado:", error);
        }
    })
    .finally(() => {
        setSubmitting(false);
    });
};

//pegar o ID do sinistro
const handleClick = (event) => {
    const id = event.currentTarget.value;
    
    Axios.get(`${process.env.REACT_APP_API_URL}/get-sinistro?id=${id}`)
        .then((response) => {
            const sin = response.data[0];
            // Armazene todos os dados do sinistro em um único objeto
            const sinistroData = {
                idsinistro: sin.id,
                aviso: sin.aviso,
                chassi: sin.chassi,
                apolice: sin.apolice,
                aon: sin.aon,
                regulador: sin.regulador,
                data: sin.data,
                observacoes: sin.observacoes,
                status: sin.estado
            };
            
            // Defina o sinistro selecionado
            setSinistroSelecionado(sinistroData);
            
            setIdSinistro(sin.id);
            setAviso(sin.aviso);
            setChassi(sin.chassi);
            setApolice(sin.apolice);
            setAon(sin.aon);
            setRegulador(sin.regulador);
            setData(sin.data);
            setObservacoes(sin.observacoes);
            setStatus(sin.estado);
            
            handleOpenAModal();
        })
        .catch((error) => {
            console.error('Erro ao fazer a solicitação GET:', error);
        });
};

//req ID sinistro do editar
const handleClickEdit = (event) => {
    const id = event.currentTarget.value;
    
    Axios.get(`${process.env.REACT_APP_API_URL}/get-sinistro?id=${id}`)
        .then((response) => {
            const sin = response.data[0];
            
            // Armazene todos os dados do sinistro em um único objeto
            const sinistroData = {
                idsinistro: sin.id,
                aviso: sin.aviso,
                chassi: sin.chassi,
                apolice: sin.apolice,
                aon: sin.aon,
                regulador: sin.regulador,
                data: sin.data,
                observacoes: sin.observacoes,
                status: sin.estado
            };
            
            // Defina o sinistro selecionado
            setSinistroSelecionado(sinistroData);
            
            // Continue atualizando os estados individuais se precisar
            setIdSinistro(sin.id);
            setAviso(sin.aviso);
            setChassi(sin.chassi);
            setApolice(sin.apolice);
            setAon(sin.aon);
            setRegulador(sin.regulador);
            setData(sin.data);
            setObservacoes(sin.observacoes);
            setStatus(sin.estado);
            
            // Abra o modal de edição
            handleOpenEModal();
        })
        .catch((error) => {
            console.error('Erro ao fazer a solicitação GET:', error);
        });
};

//salvar os dados do editar
const handleSave = (values) => {
    Axios.post(`${process.env.REACT_APP_API_URL}/edit-sinistro`, {
      id: values.idsinistro,
      apolice: values.apolice,
      status: values.status,
      aviso: values.aviso,
      chassi: values.chassi,
      aon: values.aon,
      data: values.data,
      observacoes: values.observacoes
    }).then(() => {
        toast.success("Sinistro editado!");
        window.location.reload(); // Força o recarregamento da página
    }).catch((error) => {
        if (error.response) {
             {
                toast.error("Erro ao editar o sinistro. Tente novamente.");
            }
        } else {
            console.error("Erro inesperado:", error);
        }
    })
  };

// filtro
const [filtroTipo, setFiltroTipo] = useState("apolice"); // Pode ser "apolice", "status" ou "texto"
const [filtroValor, setFiltroValor] = useState(""); // Valor do filtro selecionado
const [sinistrosFiltrados, setSinistrosFiltrados] = useState([]);

const apolices = ["PSA", "IVECO", "CNH"];
const statusList = ["Aberto", "Pendente", "Encerrado"];

useEffect(() => {
  if (!filtroValor) {
    setSinistrosFiltrados(sinistros);
    return;
  }

  const filtrados = sinistros.filter((sinistro) => {
    if (filtroTipo === "apolice") {
      return sinistro.apolice.trim().toUpperCase() === filtroValor.toUpperCase();
    }
    if (filtroTipo === "status") {
        console.log(sinistro.estado);
      return sinistro.estado.trim().toLowerCase() === filtroValor.toLowerCase();
    }
    if (filtroTipo === "texto") {
      return (
        sinistro.aviso.includes(filtroValor) ||
        sinistro.chassi.includes(filtroValor) ||
        sinistro.aon.includes(filtroValor)
      );
    }
    return true;
  });

  setSinistrosFiltrados(filtrados);
}, [sinistros, filtroTipo, filtroValor]);


    return (
        <Main icon="car" title="Sinistros" >
            <div className="p-3">
            <ToastContainer /> 
            <div className="d-flex justify-content-between pb-3">
                <button className="btn btn-success" onClick={handleOpenModal}>
                    <i className="fa fa-plus-square px-2"></i>
                   Novo Sinistro
                </button>

            </div>

            <div className="d-flex mb-3">
            <select
        className="form-control me-2"
        value={filtroTipo}
        onChange={(e) => {
          setFiltroTipo(e.target.value);
          setFiltroValor("");
        }}
      >
        <option value="apolice">Apólice</option>
        <option value="status">Status</option>
        <option value="texto">Número de Aviso, Chassi ou AON</option>
      </select>

      {filtroTipo === "texto" ? (
        <input
          type="text"
          className="form-control"
          placeholder="Digite para buscar"
          value={filtroValor}
          onChange={(e) => setFiltroValor(e.target.value)}
        />
      ) : (
        <select
          className="form-control"
          value={filtroValor}
          onChange={(e) => setFiltroValor(e.target.value)}
        >
          <option value="">Todos</option>
          {filtroTipo === "apolice"
            ? apolices.map((ap) => <option key={ap} value={ap}>{ap}</option>)
            : statusList.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
      )}
    </div>
    <table className="table table-bordered mt-4">
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
        {sinistrosFiltrados.length > 0 ? (
          sinistrosFiltrados.map((sinistro, index) => {
            const estado =
              estadoMap[sinistro.estado.toLowerCase()] || {
                label: sinistro.estado,
                color: "transparent",
              };
            return (
              <tr key={index}>
                <td>{sinistro.aviso}</td>
                <td>{sinistro.chassi}</td>
                <td>{sinistro.apolice}</td>
                <td>{sinistro.aon}</td>
                <td>{sinistro.regulador}</td>
                <td>{new Date(sinistro.data).toLocaleDateString("pt-BR")}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      backgroundColor: estado.color,
                      color: "white",
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
                    value={sinistro.id}
                    onClick={handleClickEdit}
                  >
                    <i className="fa fa-pencil-square-o"></i>
                  </button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="8" className="text-center">Nenhum sinistro encontrado</td>
          </tr>
        )}
      </tbody>
    </table>
            <div className="d-flex justify-content-between">
            <button
        className="btn btn-danger"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Anterior
      </button>
      <span>Página {page}</span>
      <button
        className="btn btn-primary"
        disabled={total < limit}
        onClick={() => setPage(page + 1)}
      >
        Próximo
      </button>
            </div>

            </div>
  {/* Modal de Detalhes do Sinistro */}
  <VerSinistrosDetalhes
    showAModal={showAModal}
    handleCloseAModal={handleCloseAModal}
    sinistro={sinistroSelecionado}
/>
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

{/* Modal do Editar sinistro */}
<EditarSinistros
  showEModal={showEModal}
  handleCloseEModal={handleCloseEModal}
  sinistro={sinistroSelecionado}
  handleSave={handleSave}
  validationSchema={validationSchema}
/>
        </Main>
    );
};

export default Sinistros