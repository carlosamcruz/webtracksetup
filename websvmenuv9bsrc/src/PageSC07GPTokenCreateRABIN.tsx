import React, { useRef, FC, useState} from 'react';

import logo from './logo.svg';
import './App.css';

import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, Tx, toByteString, PubKeyHash, hash160, buildPublicKeyHashScript, int2ByteString, reverseByteString } from "scrypt-ts";

import { GeneralToken } from "./contracts/generaltoken";
import { GeneralTokenV3RabinOracle } from "./contracts/generaltokenV3RabinOracle";
import { dataFormatScryptSC, hexToLittleEndian, scriptUxtoSize, stringToHex,
  myUTXOs, setMyUTXOsData, myUTXOData, hexToBytes, utxoDataUpdata,} from "./myUtils";

import {homepvtKey, homenetwork, compState, feeService, utxoFeeAdd1} from './Home';
import { broadcast, listUnspent, oracleWoC } from './mProviders';

import { RabinPubKey, RabinSig, SECP256K1 } from 'scrypt-ts-lib'

//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerExt: TestWallet
//let privateKey = bsv.PrivateKey.fromHex("79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0", bsv.Networks.testnet)
//let privateKey = bsv.PrivateKey.fromHex("0000000000000000000000000000000000000000000000000000000000000000", bsv.Networks.testnet)
//"79342a4c317817a80a298fe116147a74e4e90912a4f321e588a4db67204e29b0"
//"0000000000000000000000000000000000000000000000000000000000000000" 

function PageSC07GPTokenCreate() {
//const  deployACT: FC = () => {  


  const [deployedtxid, setdeptxid] = useState("");
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  let txlink2 = ""
  const nTokens = useRef<any>(null);
  const value = useRef<any>(null);
  const idData = useRef<any>(null);
  const newAdd = useRef<any>(null);

  const satsBrinde = useRef<any>(null);


  const [binaryData2, setbinaryData2] = useState<Uint8Array>(new Uint8Array());

  //sCriptType deve ser ajustado para identificar cada tipo de script
  //preferencialmente no momento que o script for arquivado
  let scriptType = 0
  const downloadBinaryFileData = () => {
    // Create a Blob from the binary data
    const blob = new Blob([binaryData2]);

    //console.log("File Size: ", binaryData2?.byteLength)

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MyArchive'+ '.' + 'txt'; // Specify the desired file name with the correct extension

    // Programmatically trigger a click event on the anchor element
    a.click();

    // Clean up the URL object and remove the anchor element
    URL.revokeObjectURL(url);
    a.remove();
  };

  const deploy = async (amount: any) => {

    if(homepvtKey.length != 64 || value.current.value < 1 || nTokens.current.value < 1)
    {
      alert('No PVT KEY or wrong data!!!')
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


        //console.log('Até aqui: ')
        
        //const instance = new Statefulsc(0n)
        //const instance = new Statefulsc(BigInt(nTokens.current.value))

        let pubKey = bsv.PublicKey.fromPrivateKey(privateKey)

        //Description of the token
        //idData Deve ser enviado em HEX format, a menos que já esteja no formato Hex
        let description = dataFormatScryptSC(stringToHex(idData.current.value), '') 

        let toNewOwner = PubKeyHash(hash160(toHex(pubKey)))
        
        if(newAdd.current.value.length > 10)
        {
          if(newAdd.current.value.substring(0,1) === '1' 
          || newAdd.current.value.substring(0,1) === 'm'
          || newAdd.current.value.substring(0,1) === 'n')
            toNewOwner = PubKeyHash(toHex(bsv.Address.fromString(newAdd.current.value).hashBuffer))        
        }

        //const instance = new GeneralToken(PubKey(toHex(pubKey)), BigInt(nTokens.current.value), description)
        //const instance = new GeneralTokenV2(PubKeyHash(hash160(toHex(pubKey))), BigInt(nTokens.current.value), description)
//        const instance = new GeneralTokenV2(toNewOwner, BigInt(nTokens.current.value), description)
        
//        await instance.connect(signer);

        //console.log('Até aqui: ')


        //console.log ('Locking Script', toHex(instance.lockingScript))



        ////////////////////////////////////////////////////////
        //Para o calculo da Taxa de Serviço
        ////////////////////////////////////////////////////////
        let utxoFeeFlag = false;

        //if(feeService > 0)
        //  utxoFeeFlag = true

        let utxoFee =  new bsv.Transaction().addOutput(new bsv.Transaction.Output({
          //script: buildPublicKeyHashScript(hash160(instance2.alice)),
          //script: buildPublicKeyHashScript(instance2.alice),
          script: buildPublicKeyHashScript(PubKeyHash(toHex(bsv.Address.fromString(utxoFeeAdd1).hashBuffer))),
          satoshis: feeService
        }))

        //Tamanho do script formatado
        let out1size = scriptUxtoSize(utxoFee.outputs[0].script.toHex()) 
        let tokenSats = (utxoFee.outputs[0].satoshis).toString(16);
        //console.log("Sat STR 0: ", tokenSats)
        while(tokenSats.length < 16)
        {
          tokenSats = '0' + tokenSats
        }

        //console.log("Token Sat: ", hexToLittleEndian(tokenSats))

        let utxo2Fee = hexToLittleEndian(tokenSats) + out1size + utxoFee.outputs[0].script.toHex()

        if(!utxoFeeFlag)
        {
          utxo2Fee = '';
        }

        //console.log("UTXO Fee: ", utxo2Fee)
        
        ////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////


//////////////////////////////////////////
//Jesus is the Lord
// Novo Deploy
//////////////////////////////////////////

        let changeAddExt: bsv.Address
        let changeADD = bsv.Address.fromPrivateKey(privateKey);

        changeAddExt = bsv.Address.fromPrivateKey(privateKey);

        let UTXOs1: bsv.Transaction.IUnspentOutput[] = []

        let utxoListOpt = ""
  
        //utxoListOpt = utxoList.current.value; 

        UTXOs1 = await listUnspent(changeADD, homenetwork)

        let UTXOs: bsv.Transaction.IUnspentOutput[] = []


        UTXOs.push(UTXOs1[0])

        for(let i = 0; i < UTXOs1.length; i++)
        {
          if(UTXOs1[i].satoshis > UTXOs[0].satoshis)
          {
            UTXOs[0] = UTXOs1[i] 
          }
        }


        //let pvScritp = false //Using previous script
        let utxoIndex = 0

        let pbkeyUserX = bsv.PublicKey.fromPrivateKey(privateKey)
        let tx3 = new bsv.Transaction

        let tx2 = new bsv.Transaction()
        let tSatoshis = 0

        /////////////////////////////////////////////////
        //A taxa vem somente da carteira
        /////////////////////////////////////////////////

        let genesisToken = ''

        for(let i = 0; i < UTXOs.length; i++)
        {
            tx2.from(UTXOs[i])
            tSatoshis = tSatoshis + UTXOs[i].satoshis

            genesisToken = genesisToken + reverseByteString(UTXOs[i].txId, 32n) 
            //+ reverseByteString(int2ByteString(BigInt(UTXOs[i].outputIndex), 4n), 4n)
            + int2ByteString(BigInt(UTXOs[i].outputIndex), 4n)
        }

        //criação do token unico do genesis
        //description = sha256(genesisToken) + description
        description = dataFormatScryptSC(stringToHex(idData.current.value), '')

        console.log('genesisToken: ', genesisToken)

        //genesisToken = dataFormatScryptSC(genesisToken, '')

        console.log('genesisToken: ', genesisToken)


        ///////////////////////
        //Oracle:
        ///////////////////////

                //const witnessServer = 'https://witnessonchain.com/v1'
        const witnessServer = 'https://oracle01.vercel.app'


        const symbol = 'BSV_USD'
        const infoResponse = await oracleWoC(`${witnessServer}/info`)

//        console.log('result: ', infoResponse)
        //console.log('R PBK: ', infoResponse[0].contact)
//        console.log('R PBK: ', infoResponse[0].publicKey)

        //console.log('R PBK: ', infoResponse[0].public_key)
        //console.log('R PBK: ', infoResponse[0].public_key.rabin)

        //let rabinPubKey = '0x' + Buffer.from(infoResponse.data.public_key.rabin, 'hex').reverse().toString('hex')
        //let rabinPubKey = '0x' + Buffer.from(infoResponse[0].public_key.rabin, 'hex').reverse().toString('hex')

        let pubKeyGen = '097b416a2866ec3442bdfb49526e99b0d855ce22ea2b295b5d740c7e540fc8916c03a9b61413946fafc61441ade94476ac828c939d960a8c7084eff143c30eb2fae88d40cc8eee6b7464aaf8cf9330ca1686b13c5f6b1d8bce5b10645782168a197fa12e047661d644c99e5444ea846bf0cf6bc8ecdcc0e6eb8f8ed0ef62c9a30dee3994de42b0e21de556e7103a14fbdd37e63eb60b21f87bf7b163783deb75b28c1960d900c21a29155c984f59e77ef81d105f7cdb184a523b131733d3d18225af56e41b696cc5b4a91f9248dcdf40b9287df27849b336159ba4354d7159b4d0b8d2a4333840059e189749361a6d1ae7df012db527018c391490d40b2e306f6f53d259275a3ab3fd8773f63a4f87631b531f05606e8b06331182a2d28b07bd098d5bdfbb2a9e158536203c4d656b8211faaa58b37a05d5344bfe8bc40fee02e9e50c63ce07dde0f21ca7b58e8bdacef6d28c177e6951b0194b057071663c6c5b3e98ab60898bfff6852bf1f1aede0f1273fa9a6da277f0c7e10136da53f418'


        let rabinPubKey = '0x' + Buffer.from(infoResponse[0].publicKey, 'hex').reverse().toString('hex')
        //let rabinPubKey = '0x' + Buffer.from(pubKeyGen, 'hex').reverse().toString('hex')
        console.log('R PBK: ', rabinPubKey)

        //let rbk: RabinPubKey = BigInt('0x'+'ad7e1e8d6d2960129c9fe6b636ef4041037f599c807ecd5adf491ce45835344b18fd4e7c92fd63bb822b221344fe21c0522ab81e9f8e848206875370cae4d908ac2656192ad6910ebb685036573b442ec1cff490c1638b7f5a181ae6d6bc9a04a305720559c893611f836321c2beb69dbf3694b9305a988c77e0a451c38674e84ce95a912833d2cf4ca9d48cc76d8250d0130740145ca19e20b1513bb93ca7665c1f110493d1b5aa344702109df5feca790f988eaa02f92e019721ae0e8bfaa9fdcd3401ffb4433fbe6e575ed9f704a6dc60872f0d23b2f43bfe5e64ce0fbc71283e6dedee79e20ad878917fa4a8257f879527c58f89a8670be591fc2815f7e7a8d74a9830788404f66170058dd7a08f47c4954324088dbed2f330015ccc36d29efd392a3cd5bf9835871f6b4b203c228af16f5b461676ce8e51003afd3137978117cf41147f2bb615a7c338bebdca5f81a43fe9b51480ae52ce04cf2f2b1714599fe09ae8401e0e155b4caa89fb37b00c604517fc36961f84901a73a343bb40')
        let rbk: RabinPubKey = BigInt(rabinPubKey)


        ///////////////////////
        ///////////////////////

        //let oraclePoint = SECP256K1.pubKey2Point(PubKey(toByteString('04c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489f2091bbc32eb56a430b759a400cddf53ba62ba936c7dda04e1f148088432a58b')))
        //let oraclePKEC = PubKey(toByteString('04c0e0bf0bbcdc53be9542359aeb1dde7c6289743b7b3460c12e2d57a478c6e489f2091bbc32eb56a430b759a400cddf53ba62ba936c7dda04e1f148088432a58b'))

        let oraclePKEC = PubKey(toByteString('049ddc6456b6e629cb27a4e5f7f4e0d7e8ddbc7b87e15754be942c57b6eeac9e159818395f8e8813f862f04b84e183725b8dab39a6b88953d3921021162f4e7d32'))

        //049ddc6456b6e629cb27a4e5f7f4e0d7e8ddbc7b87e15754be942c57b6eeac9e159818395f8e8813f862f04b84e183725b8dab39a6b88953d3921021162f4e7d32

        //General Purpose Token = 47656e6572616c20507572706f736520546f6b656e
        //this.tokenType = toByteString('47656e6572616c20507572706f736520546f6b656e');


        //Se o PreVout = genesisToken não estiver correto, o token não será capaz de gerar um novo estado 
        //const instance = new GeneralTokenV2(toNewOwner, BigInt(nTokens.current.value), description, genesisToken)      
        const instance = new GeneralTokenV3RabinOracle(
          toNewOwner, BigInt(nTokens.current.value), description, rbk, 
          //oraclePKEC,
          //toByteString('47656e6572616c20507572706f736520546f6b656e')
          )       
        await instance.connect(signer);

        tx2.addOutput(new bsv.Transaction.Output({
          //script: bsv.Script.buildPublicKeyHashOut(changeADD),
          //script: partialTx.tx.outputs[0].script,
          script: instance.lockingScript,
          satoshis: amount,
        }))

        tSatoshis = tSatoshis - amount

        if(newAdd.current.value.length > 10)
        {
          if(newAdd.current.value.substring(0,1) === '1' 
          || newAdd.current.value.substring(0,1) === 'm'
          || newAdd.current.value.substring(0,1) === 'n')
            {

              let alertAmout = 1
              
              if(satsBrinde.current.value && satsBrinde.current.value > 1)
              {
                alertAmout = satsBrinde.current.value
              }
              
              tx2.addOutput(new bsv.Transaction.Output({
                script: bsv.Script.buildPublicKeyHashOut(bsv.Address.fromString(newAdd.current.value)),
                satoshis: alertAmout,
              }))

              tSatoshis = tSatoshis - alertAmout
            }
        }

        if(utxoFeeFlag)
        {
          tx2.addOutput(utxoFee.outputs[0])
          tSatoshis = tSatoshis - feeService
        }       

        //TX do ADD
        tx2.addOutput(new bsv.Transaction.Output({
          //script: bsv.Script.buildPublicKeyHashOut(changeADD),
          script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
          satoshis: tSatoshis,
        }))

        tx2 = tx2.seal()
        tx2 = tx2.sign(privateKey)

        // Para o Calcula da TAXA de rede

        let rawTX = toHex(tx2)
        let feeTX;
        if(rawTX.substring(82, 84) === '00')
        {
            console.log('\nAJUSTE DE TAXA DE REDE \n')
            //rawTX = rawTX.substring(0, 82) + tx2.DERSEC()[0] + rawTX.substring(84, rawTX.length)
            feeTX = Math.floor(((toHex(tx2).length/2) - ('00'.length/2) + (tx2.DERSEC()[0].length/2))*0.001) + 1
        } 
        else
        {
            feeTX = Math.floor((toHex(tx2).length/2)*0.001) + 1
        }
        //console.log('\nRaw TX: ', rawTX)

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        tx2 = new bsv.Transaction()
  
        for(let i = 0; i < UTXOs.length; i++)
        {
          //if(UTXOs[i].satoshis > (3 * feeTX ) )
            tx2.from(UTXOs[i])
        }

        tx2.addOutput(new bsv.Transaction.Output({
          //script: bsv.Script.buildPublicKeyHashOut(changeADD),
          //script: partialTx.tx.outputs[0].script,
          script: instance.lockingScript,
          satoshis: amount,
        }))

        //tSatoshis = tSatoshis - amount

        if(newAdd.current.value.length > 10)
        {
          if(newAdd.current.value.substring(0,1) === '1' 
          || newAdd.current.value.substring(0,1) === 'm'
          || newAdd.current.value.substring(0,1) === 'n')
            {

              let alertAmout = 1
              
              if(satsBrinde.current.value && satsBrinde.current.value > 1)
              {
                alertAmout = satsBrinde.current.value
              }
              
              tx2.addOutput(new bsv.Transaction.Output({
                script: bsv.Script.buildPublicKeyHashOut(bsv.Address.fromString(newAdd.current.value)),
                satoshis: alertAmout,
              }))
              //tSatoshis = tSatoshis - 1
            }
        }

        if(utxoFeeFlag)
        {
          tx2.addOutput(utxoFee.outputs[0])
          //tSatoshis = tSatoshis - feeService
        }       


        //TX do ADD
        if((tSatoshis - feeTX) > 0)
        {
          tx2.addOutput(new bsv.Transaction.Output({
              //script: bsv.Script.buildPublicKeyHashOut(changeADD),
              script: bsv.Script.buildPublicKeyHashOut(changeAddExt),
              satoshis: tSatoshis - feeTX,
          }))
        }

        tx2 = tx2.seal().sign(privateKey)

        for(let i = 0; i < UTXOs.length + 1; i++)
        {
            console.log('DERSEC ', i, ': ',  tx2.DERSEC()[i])
        }
  
        rawTX = toHex(tx2)
    
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Jesus is the Lord
        /////////////////////////////////////////////////////////////////////////////////////////////////////////

        //Inserção da Assinatura do Script
        if(rawTX.substring(82, 84) === '00')
        {
            console.log('\nTest positon: ', rawTX.substring(82, 84))
            rawTX = rawTX.substring(0, 82) + tx2.DERSEC()[0] + rawTX.substring(84, rawTX.length)
        } 
        
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Jesus is the Lord
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //console.log('\nRaw TX: ', rawTX)

  
        //const txId = await provider.sendRawTransaction(rawTX)      
  
  




//////////////////////////////////////////
//Fim do novo Deploy
//////////////////////////////////////////


        //console.log('Brinde Sats: ', satsBrinde.current.value)

        //if(satsBrinde.current.value && satsBrinde.current.value > 0)
        //  console.log('Brinde Sats222: ', satsBrinde.current.value)


        


        let txId = await broadcast(rawTX, homenetwork)
        //const deployTx = await instance.deploy(amount)

        //txId = deployTx.id





        //console.log('GP Token contract deployed: ', txId)
        console.log('GP Token contract deployed: ', rawTX)
        //alert('deployed: ' + deployTx.id)
        
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + txId;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + txId;
        }
        setLinkUrl(txlink2);
  
        //setdeptxid(callTx.id)

        setdeptxid(txId)

        //let txToUtxos = new bsv.Transaction
        //txToUtxos.fromString(rawTX)

        //let ninputs = txToUtxos.inputs.length

        //let MyUtxosCurrent: myUTXOs[] = []


        if(txId.length === 64)
        {
          //let finalUTXOs = await listUnspent(bsv.Address.fromPrivateKey(privateKey), homenetwork)

          //GPToken == 103
          //let myJsonStrUTXOs2 = utxoDataUpdata(rawTX, txId, finalUTXOs, 103) 
          let myJsonStrUTXOs2 = utxoDataUpdata(rawTX, txId, null, 103) 
          
          //console.log('my UTXOs Json String 222: ', myJsonStrUTXOs2)

          //setMyUTXOsData(myJsonStrUTXOs2)

          setbinaryData2(hexToBytes(toByteString(myJsonStrUTXOs2, true)))

        }

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
          GPToken RABIN Oracle - Create
        
        </h2>

        <a href='https://medium.com/@cktcracker/create-a-gptoken-19a0ae6b3a32' target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '14px', paddingBottom: '20px', color: 'yellow' }}>
            Instructions of Use
        </a>

        

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                  
                  <label style={{ fontSize: '14px', paddingBottom: '5px' }}
                    >Inform Tetherd Satoshis and Units of Token then Press Deploy:  
                  </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={value} type="number" name="PVTKEY1" min="1" placeholder="satoshis (min 1 sat)" />
                </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={nTokens} type="number" name="PVTKEY1" min="1" placeholder="units of token (min 1)" />
                </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={idData} type="text" name="PVTKEY1" min="1" placeholder="description (optional)" />
                </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={newAdd} type="text" name="PVTKEY1" min="1" placeholder="Add 2 Send (optional)" />
                </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={satsBrinde} type="number" name="PVTKEY1" min="1" placeholder="Sats Tip (Optional)" />
                </label>     
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

          <div style={{ display: 'inline-block', textAlign: 'center'}}>
              
              <button className="insert" onClick={downloadBinaryFileData}
                  style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '20px'}}
              >Updata MyData</button>

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

export default PageSC07GPTokenCreate;
