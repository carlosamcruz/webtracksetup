import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { OddOrEvenContract } from './contracts/oddOrEvenContract';

import artifact01 from './artifacts/oddOrEvenContract.json';

OddOrEvenContract.loadArtifact(artifact01)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

