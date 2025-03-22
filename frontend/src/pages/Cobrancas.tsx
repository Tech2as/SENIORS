import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';
import { useNavigate } from 'react-router-dom'
import * as yup from "yup";
import Axios from "axios"
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Cobrancas = () => {
    return (
        <Main icon="calendar" title="Cobranças">
            <div className="p-3">
                    <ToastContainer />
                    <div className="d-flex justify-content-between pb-3">
          <button className="btn btn-success" >
            <i className="fa fa-plus-square px-2"></i>
             Exportar Planilha
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
          <th>Data Cobrança</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
      <tr>
        <td>20252203001</td>
        <td>8AD21UAM</td>
        <td>PSA</td>
        <td>61232</td>
        <td>João Borges</td>
        <td>22/03/2025</td>
        <td>
          <span>
            documentos pendentes
          </span>
        </td>
        <td className="td-actions">
        <button
                        className="btn btn-primary"
                      
                      >
                        <i className="fa fa-eye"></i>
                      </button>

          <button
                        className="btn btn-success"
         
                      >
                        <i className="fa fa-check-square"></i>
                      </button>
        </td>
      </tr>

</tbody>

        </table>
      </div>
  </Main>
    )
}

export default Cobrancas;