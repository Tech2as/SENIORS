import React from "react";
import './Nav.css';
import { Link } from "react-router-dom";

const Nav = ({onLogout, userRole }) => {
    return (
        <aside className="menu-area">
            <nav className="menu">
                <Link to="/home">
                    <i className="fa fa-home"></i> Início
                </Link>

                {/* Renderiza o link "Atendimento" apenas se o userRole não for "psicologo" */}
                {userRole !== "psicologo" && (
                    <Link to="/sinistros">
                        <i className="fa fa-car"></i> Sinistros
                    </Link>
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

