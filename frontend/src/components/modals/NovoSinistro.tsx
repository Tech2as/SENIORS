import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Modal from "../template/Modal";

const NovoSinistro = ({
    showModal,
    handleCloseModal,
    sinistro,
    handleSubmit,
    validationSchema
}: any) => {
    // Verificação de segurança para evitar erros
    if (!sinistro) return null;
    
    // Formatação da data com tratamento de erro
    const formatarData = (dataStr: any) => {
      try {
        return new Date(dataStr).toLocaleDateString("pt-BR");
      } catch (error) {
        return "Data inválida";
      }
    };

return (
    <Modal show={showModal} onClose={handleCloseModal}>
        <div className="modal-content2">
            <Formik initialValues={{
                 aviso: "",
                 chassi: "",
                 apolice: "",
                 aon: "",
                 regulador: sinistro.regulador || "",
                 data: formatarData(sinistro.data),
                 observacoes:  "",
                 status: ""
            }}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            enableReinitialize={true}>
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
                                  <Field name="aviso" type="number" />
                                  <ErrorMessage component="span" className="text-danger" name="aviso" />
                                </div>
                
                                <div className="form-group1">
                                  <label>Chassi:</label>
                                  <Field name="chassi" type="text" />
                                  <ErrorMessage component="span" className="text-danger" name="chassi" />
                                </div>
                
                                <div className="form-group1">
                                  <label>AON:</label>
                                  <Field name="aon" type="text" />
                                  <ErrorMessage component="span" className="text-danger" name="aon" />
                                </div>
                
                                <div className="form-group1">
                                  <label>Data:</label>
                                  <Field name="data" type="date" />
                                  <ErrorMessage component="span" className="text-danger" name="data" />
                                </div>
                
                                <div className="form-group1">
                                  <label>Regulador:</label>
                                  <Field name="regulador" type="text" disabled />
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
                
                                <Field name="userid" hidden />
                                <Field name="username" hidden />
                
                                <button type="submit" className="btn btn-success">Salvar</button>
                              </div>
                            </Form>

            </Formik>
        </div>

    </Modal>
)

};

export default NovoSinistro;