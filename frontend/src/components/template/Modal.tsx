import React from 'react'
import './Modal.css'

const Modal = ({ show, onClose, children }) => {
    if (!show) {
      return null;
    }
  
    return (
      <div className="modal-backdrop1">
        <div className="modal-content1">
          <button className="close-button" onClick={onClose}>×</button>
          {children}
        </div>
      </div>
    );
  };
  
export default Modal;