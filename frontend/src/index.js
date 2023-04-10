import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from "./pages";
const container = document.querySelector('#root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App />);
