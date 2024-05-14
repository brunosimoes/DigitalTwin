import * as ReactDOMClient from 'react-dom/client';
import React from 'react';
import { DefaultLayout } from '@layout/DefaultLayout';
import './index.scss';

const App = () => <DefaultLayout icon={"/static/logos/segula.png"} />;

const root = ReactDOMClient.createRoot(document.getElementById("app") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
