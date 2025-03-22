import { useState } from "react";
import './Nav.css';
import { Link, useNavigate  } from "react-router-dom";

const Nav = ({
    onLogout,
    userRole
}: any) => {

const [sinistrosAberto, setSinistrosAberto] = useState(false);
const navigate = useNavigate();

const handleSinistrosClick = () => {
    navigate("/sinistros"); // Redireciona para /sinistros
    setSinistrosAberto(!sinistrosAberto); // Alterna o submenu
};
    return (
        <aside className="menu-area">
            <nav className="menu">
                <Link to="/home">
                    <i className="fa fa-home"></i> Início
                </Link>

                {/* Renderiza o link "Atendimento" apenas se o userRole não for "psicologo" */}
                {userRole !== "psicologo" && (
               <div className="menu-item">
               <button
                   className="menu-link sinistros-button"
                   onClick={handleSinistrosClick}
               >
                   <i className="fa fa-car"></i> Sinistros
               </button>
               {sinistrosAberto && (
                   <div className="submenu">
                       <Link to="/sinistros/novo">Novo Sinistro</Link>
                       <Link to="/sinistros/pendentes">Pendentes</Link>
                       <Link to="/sinistros/finalizados">Finalizados</Link>
                   </div>
               )}
           </div>
       )}

                {userRole !== "psicologo" && (
                    <Link to="/conta">
                        <i className="fa fa-users"></i> Minha Conta
                    </Link>
                )}

                <button onClick={onLogout} className="btn btn-link deslogar">
                    <i className="fa fa-sign-out" aria-hidden="true"></i> Deslogar
                </button>
            </nav>
        </aside>
    );
};

export default Nav;

