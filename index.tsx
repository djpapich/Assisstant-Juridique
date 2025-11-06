import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Correct the import path to be relative.
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("لم يتم العثور على العنصر الجذر للتركيب.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
