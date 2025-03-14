import React from 'react';
import { Navigate } from 'react-router-dom';

// @ts-expect-error TS(7031): Binding element 'Element' implicitly has an 'any' ... Remove this comment to see the full error message
const PrivateRoute = ({ element: Element }) => {
  const token = localStorage.getItem('token');

  return token ? <Element /> : <Navigate to="/" />;
};

export default PrivateRoute;