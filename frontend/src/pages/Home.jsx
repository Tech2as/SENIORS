import React, { useEffect, useState } from 'react';
import Main from '../components/template/Main';

const Home = () => {
    return (
<Main icon="home" title="Início">
<div className="dashboard-news">
                <div className="dash-new intro-section">
                </div>
                <div className="dash-new topics-section">
                    <h2>Temas :</h2>
                    <ul>
                        <li>LOREM</li>
                    </ul>
                </div>
            </div>
</Main>
    );
};

export default Home