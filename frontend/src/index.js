import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";
import './index.css';

import App from "./App";
import {SnackbarProvider} from "notistack";
import { api } from './apiClient';

// Attach global interceptors once by importing apiClient here


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <SnackbarProvider>
            <App/>
        </SnackbarProvider>
    </BrowserRouter>
);

