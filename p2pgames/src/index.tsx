import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css';
import App from './App';

//import { GeneralToken } from './contracts/generaltoken';
//import { GeneralTokenV2 } from './contracts/generaltokenV2';
import { OddOrEvenContract } from './contracts/oddOrEvenContract';

import artifact01 from './artifacts/oddOrEvenContract.json';
//import artifact06 from './artifacts/generaltokenV2.json';

OddOrEvenContract.loadArtifact(artifact01)
//GeneralTokenV2.loadArtifact(artifact06)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

