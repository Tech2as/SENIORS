import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './main/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom'; // Importe o BrowserRouter

// @ts-expect-error TS(2345): Argument of type 'HTMLElement | null' is not assig... Remove this comment to see the full error message
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Envolva o App com BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);