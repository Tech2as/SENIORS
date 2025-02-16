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

    // Modal do abrir sinistro
    const [showModal, setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    //Modal do ver detalhes do sinistro
    const [showAModal, setshowAModal] = useState(false);
    const handleOpenAModal = () => setshowAModal(true);
    const handleCloseAModal = () => setshowAModal(false)

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
                        <tr>
                            <td>20250902001</td>
                            <td>8ADA8229ADSAM</td>
                            <td>PSA</td>
                            <td>AON</td>
                            <td>João Borges</td>
                            <td>09/02/2025</td>
                            <td>21</td>
                            <td className="td-actions">
                                <button className="btn btn-primary" onClick={handleOpenAModal}>
                                    <i className="fa fa-eye"></i>
                                </button>
                                <button className="btn btn-warning">
                                    <i className="fa fa-pencil-square-o"></i>
                                </button>
                            </td>
                        </tr>

                </tbody>
            </table>

            </div>
{/* Modal do Novo Sinistro */}
<Modal show={showModal} onClose={handleCloseModal}>
                <div className="modal-content2">
                    <Formik initialValues={{ }}
                        >
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
                    <Formik initialValues={{ }}
                        >
                        <Form action="">
                            <h2>Detalhes do sinistro</h2>
                            <div className="modal-inside">
                                <div className="form-group1">
                                    <label>Apólice:</label>
                                    <Field type="text" name="apolice">
                                    </Field>
                                </div>

                                <div className="form-group1">
                                    <label>Número de aviso:</label>
                                    <Field name="aviso"
                                        type="number"
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>Chassi:</label>
                                    <Field name="chassi"
                                        type="text"
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>AON:</label>
                                    <Field name="aon"
                                        type="text"
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>Regulador:</label>
                                    <Field name="regulador"
                                        type="text"
                                    />
                                </div>

                                <div className="form-group1">
                                    <label>Data:</label>
                                    <Field name="data"
                                        type="date"
                                    />
                                </div>

                                <div className="form-group1">
                                    <label htmlFor="observacoes">Observações:</label>
                                    <Field
                                        as="textarea"
                                        id="observacoes"
                                        name="observacoes"
                                        className="form-control"
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