import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';
import { useNavigate } from 'react-router-dom'
import * as yup from "yup";
import Axios from "axios"
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import VerSinistrosDetalhes from "../components/modals/VerDetalhesSinistro";
import EditarSinistros from '../components/modals/EditarSinistros';
import NovoSinistro from '../components/modals/NovoSinistro';

// Interfaces para tipagem
interface SinistroData {
    id?: string;
    idsinistro?: string;
    aviso: string;
    chassi: string;
    apolice: string;
    aon: string;
    regulador: string;
    data: string;
    observacoes: string;
    estado?: string;
    status?: string;
}

interface CustomJwtPayload extends JwtPayload {
    id: string;
    nome: string;
}

interface EstadoMapping {
    [key: string]: { label: string; color: string };
}

const Sinistros = () => {
    const navigate = useNavigate();

    // Código da renderização dos sinistros
    const [sinistros, setSinistros] = useState<SinistroData[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [total, setTotal] = useState(0);
     
    // Modal do abrir sinistro
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    // Modal global
    const [sinistroSelecionado, setSinistroSelecionado] = useState<SinistroData | null>(null);

    // Modal do ver detalhes do sinistro
    const [showAModal, setshowAModal] = useState(false);
    const handleOpenAModal = () => setshowAModal(true);
    const handleCloseAModal = () => setshowAModal(false);

    // Modal do editar sinistro
    const [showEModal, setshowEModal] = useState(false);
    const handleOpenEModal = () => setshowEModal(true);
    const handleCloseEModal = () => setshowEModal(false);

    // Pegando do local storage
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Const para verificação de detalhes de cada sinistro
    const [idsinistro, setIdSinistro] = useState('');
    const [aviso, setAviso] = useState('');
    const [chassi, setChassi] = useState('');
    const [apolice, setApolice] = useState('');
    const [aon, setAon] = useState('');
    const [regulador, setRegulador] = useState('');
    const [data, setData] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [status, setStatus] = useState('');

    const estadoMap: EstadoMapping = {
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
                const decodedToken = jwtDecode<CustomJwtPayload>(token); // Decodifica o token com tipo definido

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
      fetchSinistros();
  }, [page, userId]);

  const nextPage = () => {
    if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
    }
};

const prevPage = () => {
    if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
};

  const fetchSinistros = async () => {
    if (loading) return; // Evita múltiplas chamadas simultâneas

    setLoading(true); // Indica que a busca começou

    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const response = await Axios.get(`${apiUrl}/filter-sinistro?tipo=${filtroTipo}&status=${filtroValor}&page=${page}&limit=5`);
        
        setSinistros(response.data.data);
        setTotalPages(response.data.totalPages);
    } catch (error) {
        console.error("Erro ao buscar sinistros:", error);
    } finally {
        setLoading(false); // Finaliza o carregamento
    }
};


    // Salvar os dados do novo sinistro
    const handleSubmit = (values: SinistroData, {
        setSubmitting
    }: {
        setSubmitting: (isSubmitting: boolean) => void
    }) => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        Axios.post(`${apiUrl}/save-sinistro`, {
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
            fetchSinistros(); // Atualiza a lista após salvar
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

    // Pegar o ID do sinistro
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const id = event.currentTarget.value;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        Axios.get(`${apiUrl}/get-sinistro?id=${id}`)
        .then((response) => {
            const sin = response.data[0];
            // Armazene todos os dados do sinistro em um único objeto
            const sinistroData: SinistroData = {
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

    // Req ID sinistro do editar
    const handleClickEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
        const id = event.currentTarget.value;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        Axios.get(`${apiUrl}/get-sinistro?id=${id}`)
        .then((response) => {
            const sin = response.data[0];
            
            // Armazene todos os dados do sinistro em um único objeto
            const sinistroData: SinistroData = {
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

    // Salvar os dados do editar
    const handleSave = (values: SinistroData) => {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        Axios.post(`${apiUrl}/edit-sinistro`, {
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
            handleCloseEModal();
            fetchSinistros(); // Atualiza a lista após salvar
        }).catch((error) => {
            if (error.response) {
                toast.error("Erro ao editar o sinistro. Tente novamente.");
            } else {
                console.error("Erro inesperado:", error);
            }
        })
    };

    //filtro
    interface Opcoes {
        apolice: string[];
        estado: string[];
      }
      
      const [opcoes, setOpcoes] = useState<Opcoes>({
        apolice: ["Todos", "PSA", "IVECO", "CNH"],
        estado: ["Todos", "Pendente", "Aberto", "Encerrado"], 
      });


  const [filtroTipo, setFiltroTipo] = useState("texto");
  const [filtroValor, setFiltroValor] = useState("");
  const [buscarnome, setBuscarNome] = useState('');

  return (
    <Main icon="car" title="Sinistros">
      <div className="p-3">
        <ToastContainer />
        
        <div className="d-flex justify-content-between pb-3">
          <button className="btn btn-success" onClick={handleOpenModal}>
            <i className="fa fa-plus-square px-2"></i>
              Novo Sinistro
          </button>
        </div>
        
        {/* Filtros */}
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
            <option value="estado">Status</option>
            <option value="texto">Número de Aviso, Chassi ou AON</option>
          </select>
          
          {filtroTipo === "texto" ? (
  <input
    type="text"
    className="form-control me-2"
    placeholder="Digite para buscar"
    name={buscarnome}
    value={filtroValor}
    onChange={(e) => setFiltroValor(e.target.value)}
  />
) : (
  <select
    className="form-control me-2"
    value={filtroValor}
    onChange={(e) => setFiltroValor(e.target.value)}
  >
    <option value="">Selecione...</option>
    {opcoes[filtroTipo as keyof Opcoes]?.map(item => (
      <option key={item} value={item}>{item}</option>
    ))}
  </select>
)}
          
          <button 
            onClick={fetchSinistros}
            className="btn btn-primary px-2"
            disabled={loading}
          >
            {loading ? "Carregando..." : <i className="fa fa-search"></i>}
            
          </button>
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
      {sinistros.length > 0 ? (
  sinistros.map((sinistro, index) => { 
    const estado = sinistro.estado 
      ? estadoMap[sinistro.estado.toLowerCase()] || { label: sinistro.estado, color: "transparent" }
      : { label: "Indefinido", color: "gray" };

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
    <td colSpan={8} className="text-center">Nenhum sinistro encontrado</td>
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
  
  <span>Página {page} de {totalPages}</span>

  <button
    className="btn btn-primary"
    disabled={page >= totalPages} // Correção aqui!
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
     <NovoSinistro
      showModal={showModal}
      handleCloseModal={handleCloseModal}
      sinistro={sinistroSelecionado}
      handleSubmit={handleSubmit}
      validationSchema={validationSchema}
     />

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

export default Sinistros;