import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Routes } from './routes'
import 'antd-mobile/dist/antd-mobile.css';
import '@/styles/main.css';
import "tailwindcss/tailwind.css";
import { Header } from './components/Header';

ReactDOM.render(
    <Router>
        <Header />
        <Routes />
    </Router>,
    document.getElementById('root')
)