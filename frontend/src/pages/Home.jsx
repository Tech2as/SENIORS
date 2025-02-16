import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';

const Home = () => {
    return (
<Main icon="home" title="Início">
<div className="dashboard-news">
                <div className="dash-new intro-section">
                    <p>
                        A saúde mental é um estado de bem-estar que envolve a integridade emocional, psicológica e social de uma pessoa. 
                        Ela está relacionada à forma como a pessoa reage às exigências da vida, lida com o estresse e se relaciona com os outros. 
                        A saúde mental é um componente integral da saúde e do bem-estar, e é influenciada por fatores biológicos, psicológicos e sociais.
                    </p>
                </div>
                <div className="dash-new topics-section">
                    <h2>Temas abordados:</h2>
                    <ul>
                        <li>Transtorno de personalidade</li>
                        <li>Ansiedade e depressão</li>
                        <li>Lidar com a tristeza</li>
                        <li>Superar crises</li>
                        <li>Cuidados em tempos de home office</li>
                        <li>Tratamento psicológico associado a medicamentos</li>
                    </ul>
                </div>
            </div>
</Main>
    );
};

export default Home