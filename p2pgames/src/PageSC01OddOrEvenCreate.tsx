import React, { useRef, FC, useState} from 'react';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, PubKeyHash, hash160, int2ByteString } from "scrypt-ts";

import { OddOrEvenContract } from "./contracts/oddOrEvenContract";
import { dataFormatScryptSC, stringToHex} from "./myUtils";

import {homepvtKey, homenetwork, compState} from './Home';
import { chainInfoWoC } from './mProviders';

//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerExt: TestWallet

function PageSC01OddOrEvenCreate() {
//const  deployACT: FC = () => {  


  const [deployedtxid, setdeptxid] = useState("");
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  let txlink2 = ""
 
  const gameKeyIn = useRef<any>(null);
  const value = useRef<any>(null);
  const optionP1In = useRef<any>(null);
  const oddness = useRef<any>(null);


  const deploy = async (amount: any) => {

    if(homepvtKey.length != 64 || gameKeyIn.current.value.length != 64 || value.current.value < 1000 )
    {
      alert('No PVT KEY or Min amount not met or Game Key!!!')
    }
    else
    {
      setdeptxid("Wait!!!")


      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});


      //let privateKey = bsv.PrivateKey.fromHex(homepvtKey, bsv.Networks.testnet)
      let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork)

      Alice = new TestWallet(privateKey, provider)

      try {

        //await Statefulsc.compile()

        const amount = value.current.value

        const signer = Alice
        //const message = toByteString('hello world', true)
        //Linha necessária nesta versão
        //O signee deve ser connectado
        await signer.connect(provider)

        let pubKey = bsv.PublicKey.fromPrivateKey(privateKey)

        let info = await chainInfoWoC(homenetwork == bsv.Networks.testnet? false: true)

        console.log("chainInfoWoC: ", info[0].blocks);
        
        console.log("toByteString(gameKeyIn.current.value)", toByteString(gameKeyIn.current.value))
        console.log("sha256(toByteString(gameKeyIn.current.value))", sha256(toByteString(gameKeyIn.current.value)))
        console.log("sha256(gameKeyIn.current.value)", sha256(gameKeyIn.current.value))
        console.log("int2ByteString(optionP1)", int2ByteString(optionP1In.current.value))

        //let gameKey = sha256(toByteString(gameKeyIn.current.value));
        //let optionP1 = 5n;
        let hashOption1 = sha256(gameKeyIn.current.value + int2ByteString(optionP1In.current.value))
        let oddnessP1: boolean = (oddness.current.value == 0)? false: true;
        console.log("hashOption1", hashOption1)

        let plaformAdd = "4d50908e5ef2d5cbf3402cc1785b6e702334492e" // mnZkqZESiQBfcDkQK11DAGXhWndUv7eWos

        const instance = new OddOrEvenContract(
          PubKeyHash(hash160(toHex(pubKey))), 
          hashOption1,
          oddnessP1,
          PubKeyHash(plaformAdd),
          //O bloco minimo do contrato será o próximo bloco
          BigInt(info[0].blocks + 1)
        )
        

        await instance.connect(signer);

        console.log('Até aqui: ')
        //const deployTx = await instance.deploy(amount)

        const deployTx = new bsv.Transaction(await instance.deploy( amount ));
        console.log('GP Token contract deployed: ', deployTx.id)
        //alert('deployed: ' + deployTx.id)
        
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + deployTx.id;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + deployTx.id;
        }
        setLinkUrl(txlink2);
  
        setdeptxid(deployTx.id)

      } catch (e) {
        console.error('deploy GPToken failes', e)
        alert('deploy GPToken failes')
      }
    }
  };



  return (
    <div className="App">

        <header className="App-header">
          

        <h2 style={{ fontSize: '34px', paddingBottom: '20px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          Odd or Even Challange - Create
        
        </h2>

        <a href='https://medium.com/@cktcracker/create-a-gptoken-19a0ae6b3a32' target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '14px', paddingBottom: '20px', color: 'yellow' }}>
            Instructions of Use
        </a>

        
        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                  
                  <label style={{ fontSize: '14px', paddingBottom: '5px' }}
                    >Amount of Satoshis for The Challange:  
                  </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={value} type="number" name="PVTKEY1" min="1" placeholder="satoshis (min 1000 sat)" />
                </label>     
        </div>

        <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={gameKeyIn} type="hex" name="GameKey" min="1" placeholder="256 bits game key" />
                </label>     
            </div>
        </div>

        <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={optionP1In} type="number" name="OptionNumber" min="1" placeholder="Number Option >= 0" />
                </label>     
            </div>
        </div>

        <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={oddness} type="number" name="OptionNumber" min="1" placeholder="0 = even | 1 = odd" />
                </label>     
            </div>
        </div>

        

        <button className="insert" onClick={deploy}
                style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '5px'}}
        >Deploy</button>
                              
        {
          deployedtxid.length === 64?
          
         /* <button onClick={handleCopyClick}>Copy to ClipBoard</button> */

          <div>
          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '20px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {deployedtxid} </p>
          </div>
          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                {linkUrl}</a></p>
          </div>
        </div>
          
          
          :

          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '20px' }}>
          <p className="responsive-label" style={{ fontSize: '12px' }}>{deployedtxid} </p>
        </div>
          
      }

      </header>
    </div>
  );
}

export default PageSC01OddOrEvenCreate;
