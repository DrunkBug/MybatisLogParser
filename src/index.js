import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import MybatisLogParser from './components/mybatis-log-parser.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MybatisLogParser />
  </React.StrictMode>
);

