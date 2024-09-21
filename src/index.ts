import React from "react";
import * as ReactDOM from "react-dom/client";
import {App} from './app';
import './style.css';

const root = ReactDOM.createRoot(document.querySelector('.root'))
root.render(React.createElement(App, {}, null));
