import './Header.css'
import React, { useEffect, useState } from 'react';
import Axios from 'axios';

const MyComponent = (props: any) => {
    const [name, setName] = useState('');
    
    const token = localStorage.getItem('token');

    useEffect(() => {
        Axios.get('http://localhost:3002/search-name-user',{
            headers: {
                'x-access-token': token,
            },
        })
            .then(response => {
                setName(response.data.nome); // Assuming response.data is the desired name
            })
            .catch(error => {
                console.error('Houve um erro ao buscar os dados do cliente:', error);
            });
    }, []);

    return (
        <header className="header d-none d-sm-flex justify-content-center">
            <h1 className="mt-3 d-flex">
                <i className={`fa fa-${props.icon}`}></i> {props.title}
            </h1>

            <div id="propsname">
                <h3 id="name-header">Olá, {name || props.name}!</h3>
            </div>
        </header>
    );
};

export default MyComponent;