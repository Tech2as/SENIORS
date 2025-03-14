import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Modal from "../template/Modal";

const EditarSinistros = ({
  showEModal,
  handleCloseEModal,
  sinistro,
  handleSave,
  validationSchema
}: any) => {
  // Verificação de segurança para evitar erros
  if (!sinistro) return null;

  // Formatação da data com tratamento de erro
  const formatarData = (dataStr: any) => {
    try {
      return new Date(dataStr).toISOString().split('T')[0];
    } catch (error) {
      return "";
    }
  };

  return (
    <Modal show={showEModal} onClose={handleCloseEModal}>
      <div className="modal-content2">
        <Formik
          initialValues={{
            idsinistro: sinistro.idsinistro || "",
            aviso: sinistro.aviso || "",
            chassi: sinistro.chassi || "",
            apolice: sinistro.apolice || "",
            aon: sinistro.aon || "",
            regulador: sinistro.regulador || "",
            data: sinistro.data ? formatarData(sinistro.data) : "",
            observacoes: sinistro.observacoes || "",
            status: sinistro.status || ""
          }}
          onSubmit={handleSave}
          validationSchema={validationSchema}
          enableReinitialize={true}
        >
          <Form>
            <h2>Editar Sinistro</h2>
            <div className="modal-inside">
              <div className="form-group1">
                <label htmlFor="apolice">Apólice:</label>
                <Field as="select" id="apolice" name="apolice" className="form-control">
                  <option value="">Selecione uma apólice</option>
                  <option value="PSA">PSA</option>
                  <option value="IVECO">IVECO</option>
                  <option value="CNH">CNH</option>
                </Field>
                <ErrorMessage component="span" className="text-danger" name="apolice" />
              </div>

              <div className="form-group1">
                <label htmlFor="status">Status do processo:</label>
                <Field as="select" id="status" name="status" className="form-control">
                  <option value="">Selecione</option>
                  <option value="aberto">Processo aberto</option>
                  <option value="pendente">Documentos faltantes</option>
                  <option value="encerrado">Processo encerrado</option>
                </Field>
                <ErrorMessage component="span" className="text-danger" name="status" />
              </div>

              <div className="form-group1">
                <label htmlFor="aviso">Número de aviso:</label>
                <Field id="aviso" name="aviso" type="number" className="form-control" />
                <ErrorMessage component="span" className="text-danger" name="aviso" />
              </div>

              <div className="form-group1">
                <label htmlFor="chassi">Chassi:</label>
                <Field id="chassi" name="chassi" type="text" className="form-control" />
                <ErrorMessage component="span" className="text-danger" name="chassi" />
              </div>

              <div className="form-group1">
                <label htmlFor="aon">AON:</label>
                <Field id="aon" name="aon" type="text" className="form-control" />
                <ErrorMessage component="span" className="text-danger" name="aon" />
              </div>

              <div className="form-group1">
                <label htmlFor="data">Data:</label>
                <Field id="data" name="data" type="date" className="form-control" />
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

              <Field name="idsinistro" hidden />
              <Field name="username" hidden />

              <button type="submit" className="btn btn-success">Salvar</button>
            </div>
          </Form>
        </Formik>
      </div>
    </Modal>
  );
};

export default EditarSinistros;