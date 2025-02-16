import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';
import Modal from "../components/template/Modal"
import { Formik, Form, Field, ErrorMessage } from "formik"
import Axios from "axios"
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
const Consultas = () => {

    return (
        <Main icon="users" title="Consultas" >
            <div className="p-3">
            <ToastContainer /> 
            <table className="table table-bordered mt-4">
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td className="td-actions">   
                <button className="btn btn-info" disabled>
                    <i className="fa fa-check-circle"></i> Consulta aceita
                </button>
                <>
                    <button
                        className="btn btn-success"
                    >
                        <i className="fa fa-check"></i> Aceitar consulta
                    </button>
                    <button className="btn btn-danger">
                        <i className="fa fa-trash"></i> Cancelar consulta
                    </button>
                </>
        </td>
    </tr>

                </tbody>
            </table>

            </div>

        </Main>
    );
};

export default Consultas