import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router } from 'react-router-dom'
import { Routes } from './routes'
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
