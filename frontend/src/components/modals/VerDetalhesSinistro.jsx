import React from "react";
import { Formik, Form, Field } from "formik";
import Modal from "../template/Modal";

const VerSinistrosDetalhes = ({ showAModal, handleCloseAModal, sinistro }) => {
  // Verificação de segurança para evitar erros
  if (!sinistro) return null;
  
  // Formatação da data com tratamento de erro
  const formatarData = (dataStr) => {
    try {
      return new Date(dataStr).toLocaleDateString("pt-BR");
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Modal show={showAModal} onClose={handleCloseAModal}>
      <div className="modal-content2">
        <Formik
          initialValues={{
            idsinistro: sinistro.idsinistro || "",
            aviso: sinistro.aviso || "",
            chassi: sinistro.chassi || "",
            apolice: sinistro.apolice || "",
            aon: sinistro.aon || "",
            regulador: sinistro.regulador || "",
            data: formatarData(sinistro.data),
            observacoes: sinistro.observacoes || "",
            status: sinistro.status || "",
          }}
          enableReinitialize={true}
        >
          {() => (
            <Form>
              <h2>Detalhes do sinistro</h2>
              <div className="modal-inside">
                {[
                  { label: "Apólice", name: "apolice" },
                  { label: "Status do processo", name: "status" },
                  { label: "Número de aviso", name: "aviso", type: "number" },
                  { label: "Chassi", name: "chassi" },
                  { label: "AON", name: "aon" },
                  { label: "Regulador", name: "regulador" },
                  { label: "Data", name: "data" },
                ].map(({ label, name, type = "text" }) => (
                  <div className="form-group1" key={name}>
                    <label htmlFor={name}>{label}:</label>
                    <Field 
                      id={name}
                      name={name} 
                      type={type} 
                      disabled 
                      className="form-control"
                    />
                  </div>
                ))}
                
                <div className="form-group1">
                  <label htmlFor="observacoes">Observações:</label>
                  <Field 
                    as="textarea" 
                    id="observacoes" 
                    name="observacoes" 
                    className="form-control" 
                    disabled 
                  />
                </div>
                
                <button 
                  onClick={handleCloseAModal} 
                  type="button" 
                  className="btn btn-primary"
                >
                  Ok
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default VerSinistrosDetalhes;