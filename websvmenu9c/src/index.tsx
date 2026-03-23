import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Helloworld02 } from './contracts/helloworld02';
import { Statefulsc } from './contracts/stateful';
import { GeneralToken } from './contracts/generaltoken';
import { MarketPlaceToken } from './contracts/mPlaceToken';
import { ErrorSC } from './contracts/errorSC';
import { GeneralTokenV2 } from './contracts/generaltokenV2';
import { GeneralTokenV3EcdsaOracle } from './contracts/generaltokenV3ecdsaOracle';
import { GeneralTokenV3EcdsaOracleMin } from './contracts/generaltokenV3ecdsaOracleMin';
import { GeneralTokenV3RabinOracle } from './contracts/generaltokenV3RabinOracle';


//import artifact from '../artifacts/src/contracts/helloworld02.json';
import artifact from './artifacts/helloworld02.json';
import artifact02 from './artifacts/stateful.json';
import artifact03 from './artifacts/generaltoken.json';
import artifact04 from './artifacts/mPlaceToken.json';
import artifact05 from './artifacts/errorSC.json';
import artifact06 from './artifacts/generaltokenV2.json';
import artifact07 from './artifacts/generaltokenV3ecdsaOracle.json';
import artifact08 from './artifacts/generaltokenV3RabinOracle.json';
import artifact09 from './artifacts/generaltokenV3ecdsaOracleMin.json';


Helloworld02.loadArtifact(artifact);
Statefulsc.loadArtifact(artifact02)
GeneralToken.loadArtifact(artifact03)
MarketPlaceToken.loadArtifact(artifact04)
ErrorSC.loadArtifact(artifact05)
GeneralTokenV2.loadArtifact(artifact06)
GeneralTokenV3EcdsaOracle.loadArtifact(artifact07)
GeneralTokenV3RabinOracle.loadArtifact(artifact08)
GeneralTokenV3EcdsaOracleMin.loadArtifact(artifact09)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
