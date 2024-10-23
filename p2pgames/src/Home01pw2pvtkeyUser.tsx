// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString } from "scrypt-ts";
import './App.css';

import { hexToBytes } from './myUtils';
import { convertBinaryToHexString , myData, setMyData} from './myUtils';


export let homepvtKey: string = "";
export let homenetwork = bsv.Networks.testnet;
export let compState = true;



//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;

const Home01pw2pvtkeyUser: FC = () => {

  const [hexpvtkey, sethexpvtkey] = useState("");
  const [pvtkeyAlert, setpvtkeyAlert] = useState("");
  const [pvtkeyAlert02, setpvtkeyAlert02] = useState("");
  const [pvtkeyAlert03, setpvtkeyAlert03] = useState("");
  const [address, setaddress] = useState("");

  const [createAlert, setCreateAlert] = useState("Aperte para Criar");

  let localPvtKey = useRef<any>(null);
  let localPvtKeyR = useRef<any>(null);

  let localEmail = useRef<any>(null);

  setMyData('123456')
  console.log('Teste Change: ', myData.data)

  let a = sha256('01').toString()
  let privateKey = bsv.PrivateKey.fromHex(a, bsv.Networks.mainnet);
  //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
  privateKey.compAdd(true);

  const [downloadFile, setdownloadFile] = useState(false);
  const [binaryData, setbinaryData] = useState<Uint8Array>(new Uint8Array());

  const downloadBinaryFile = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryData]);

    console.log("File Size: ", binaryData?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wsm-' + address + '.' + "txt"; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };


  const insertPVT = async (amount: any) => {

    setdownloadFile(false)
    //Criação da CHAVE PRIVADA através do Password

    let toAlert = ""

    if((localEmail.current.value).indexOf("@") === -1 
    || (localEmail.current.value).indexOf(".") === -1)
      toAlert = 'E-mail Incorreto'
    if(localPvtKey.current.value.length < 8 || localPvtKeyR.current.value.length < 8)
    {
      if(toAlert.length > 0)
        toAlert += ' | ' 

      toAlert += 'Senha Pequena'
    }  

    if(localPvtKey.current.value !== localPvtKeyR.current.value)
    {
      if(toAlert.length > 0)
        toAlert += ' | ' 

      toAlert += 'Senhas Diferentes'
    }  


    if( localPvtKey.current.value.length >= 8 && localPvtKey.current.value === localPvtKeyR.current.value 
      && (localEmail.current.value).indexOf("@") !== -1 
      && (localEmail.current.value).indexOf(".") !== -1)
    {
      console.log('PassW: ', localPvtKey.current.value)
      console.log('Email: ', localEmail.current.value)


      console.log('PassW Hex: ', Buffer.from(localEmail.current.value + localPvtKey.current.value, 'utf-8').toString('hex'))
      let base = Buffer.from(localEmail.current.value + localPvtKey.current.value, 'utf-8').toString('hex')
      //let a = sha256(base).toString()
      a = sha256(base).toString()
      for(let i = 0; i < base.length; i ++ )
      {
        a = a + base.charAt(i) + base.charAt(i)
        //console.log('a: ', a)
        a = sha256(a).toString()
      }
      //a = sha256(a)
      //homepvtKey = a
      console.log('PVT Key: ',a)


      privateKey = bsv.PrivateKey.fromHex(a, bsv.Networks.mainnet);

      setaddress(bsv.Address.fromPrivateKey(privateKey).toString())

      setCreateAlert("Nova Chave Privada:")
      sethexpvtkey(a)
      //setpvtkeyAlert('Envie sua nova chave privada e endereço para o seu e-mail.')
      //setpvtkeyAlert02('Não Compartilhe sua Chave Privada com Ningúem.')
      //setpvtkeyAlert03('Se perder a sua Nova Chave, ela não pode ser recuperada.')
      //setpvtkeyAlert04('If you lose the Private Key, it can not be recovered!!!')


      let cpFile = 'Dados de Formação da Nova Chave Privada\n\n'
                    + '-------------------------------------------------------------------------------------\n'
                    + '-------------------------------------------------------------------------------------\n'
                    + 'E-mail: ' + localEmail.current.value
                    + '\n\nSenha: ' +   localPvtKey.current.value
                    + '\n\nChave Privada: ' + a
                    + '\n\nEndereço: ' + bsv.Address.fromPrivateKey(privateKey).toString()
                    + '\n-------------------------------------------------------------------------------------\n'
                    + '-------------------------------------------------------------------------------------'
                    + '\n\n****     Guarde a sua nova chave privada em local seguro     ****'
                    + '\n****      Não Compartilhe sua Chave Privada com Ningúem      ****'
                    + '\n**** Se perder a sua Nova Chave, ela não pode ser recuperada ****'

      let dataTX = toByteString(cpFile, true)


      let bytes = hexToBytes(dataTX);

      setbinaryData(bytes)

      if(bytes.length > 0)
      {
        setdownloadFile(true)
        //setwaitAlert("Download File!!!");

        //console.log("download file: ", downloadFile)
        //console.log("File Type: ", fileType)

      }

    }
    else
    {
      alert(toAlert);
      sethexpvtkey('')
      setpvtkeyAlert('')
      setpvtkeyAlert02('')
      setpvtkeyAlert03('')
      setCreateAlert("Tente Novamente")
    }

  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        
        Nova Chave de Usuário
        
      </h2>

      <div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >Insira um e-mail e uma senha nova:  
                </label>     
          </div>

          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={localEmail} type="text" name="PVTKEY1" min="1" placeholder="e-mail:" />
                </label>     
            </div>

        </div>

      <div>
            <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={localPvtKey} type="password" name="PVTKEY1" min="1" placeholder="Nova Senha (8 char min):" />
                </label>     
            </div>
        </div>

        <div>
            <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                  {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                  <input ref={localPvtKeyR} type="password" name="PVTKEY1" min="1" placeholder="Repetir Senha:" />
                </label>     
            </div>
        </div>

        <div>
            <div style={{ display: 'inline-block', textAlign: 'center' }}>
                
                <button className="insert" onClick={insertPVT}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >Criar</button>

            </div>
        </div>

        {
          hexpvtkey !== ''?

          <div>

              <div className="label-container" style={{ display: 'flex', flexDirection: 'row', textAlign: 'center' }}>
                            <label className="responsive-label" htmlFor="output1"  
                            style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '20px'}}                           
                            >
                                {createAlert//'Nova Chave:'
                                } 
                            </label>
                            <span>&nbsp;</span>
                            <label className="responsive-label" htmlFor="output1"  
                            style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '20px', color: 'yellow'}}                           
                            >
                                {'' + hexpvtkey} 
                            </label>
                            <output id="output1"></output>

                          {/*
                            <label className="responsive-label" ref={labelRef} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                            >
                              {pubkey}

                            </label>       */}            
              </div>

              <div className="label-container" style={{ display: 'flex', flexDirection: 'row', textAlign: 'center' }}>
                            <label className="responsive-label" htmlFor="output1"  
                            style={{ fontSize: '12px', paddingBottom: '20px'}}                           
                            >
                                {'Endereço:'
                                } 
                            </label>
                            <span>&nbsp;</span>
                            <label className="responsive-label" htmlFor="output1"  
                            style={{ fontSize: '12px', paddingBottom: '20px', color: 'lightgreen'}}                           
                            >
                                {'' + address} 
                            </label>
                            <output id="output1"></output>

                          {/*
                            <label className="responsive-label" ref={labelRef} style={{ fontSize: '12px', paddingBottom: '5px' }} 
                            >
                              {pubkey}

                            </label>       */}            
              </div>

              {/*

              <div style={{ textAlign: 'center', paddingBottom: '20px', paddingTop: '0px' }}>
                  <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                  >
                      {pvtkeyAlert} 
                  </label>
                  <output id="output1"></output>
              </div>
              <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {pvtkeyAlert02} 
                          </label>
                          <output id="output1"></output>             
              </div>
              <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                          <label htmlFor="output1"  style={{ fontSize: '12px', paddingBottom: '5px' }}                           
                          >
                              {pvtkeyAlert03} 
                          </label>
                          <output id="output1"></output>             
              </div>
              <a href='https://forms.gle/MeqWXopMLyxBmfDc8' target="_blank" rel="noopener noreferrer"
                style={{ fontSize: '14px', paddingBottom: '5px', color: 'cyan' }}>
                envie por email
              </a>

            */}

          </div>
          :
          <div className="label-container" style={{ display: 'flex', flexDirection: 'row', textAlign: 'center' }}>
                    <label className="responsive-label" htmlFor="output1"  
                    style={{ fontSize: '12px', paddingBottom: '20px'}}                           
                    >
                        {createAlert//'Nova Chave:'
                        } 
                    </label>            
          </div>
        }

        {
          downloadFile?
          <div>
            <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '15px', paddingTop: '20px'}}>
                
                <button className="insert" onClick={downloadBinaryFile}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >Download Chave</button>

            </div>
          </div>
          :
          //<div></div>
          ''
        }

        {/*

        <a href='https://medium.com/@cktcracker/new-private-key-95f5b98a8aa0' target="_blank" rel="noopener noreferrer"
        style={{ fontSize: '14px', paddingBottom: '5px', color: 'yellow' }}>
            Instructions of Use
        </a>

        */
        }

    </div>
  );
};

export default Home01pw2pvtkeyUser;