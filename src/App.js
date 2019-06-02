import {Table, Grid, Button, Form } from 'react-bootstrap';
import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';


class App extends Component {
 
    state = {
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      transactionReceipt: ''   
    };
   
    captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)    
      };

    convertToBuffer = async(reader) => {
        const buffer = await Buffer.from(reader.result);
      
        this.setState({buffer});
    };

    onClick = async () => {

    try{
        this.setState({blockNumber:"loading..."});
        this.setState({gasUsed:"loading..."});

        await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, transactionReceipt)=>{
          console.log(err,transactionReceipt);
          this.setState({transactionReceipt});
        }); 

        await this.setState({blockNumber: this.state.transactionReceipt.blockNumber});
        await this.setState({gasUsed: this.state.transactionReceipt.gasUsed});    
      } 
    catch(error){
        console.log(error);
      } 
  } 

    onSubmit = async (event) => {
      event.preventDefault();

      
    
      
      const accounts = await web3.eth.getAccounts();
      
      const ethAddress= await storehash.options.address;
      this.setState({ethAddress});

      await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        this.setState({ ipfsHash:ipfsHash[0].hash });
        
        storehash.methods.sendHash(this.state.ipfsHash).send({
          from: accounts[0]
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        }); 
      })  
    }; 
  
    render() {
      
      return (
        <div >
          <header className="Header">
            <h1 className="TitleCenter"> File Management System</h1>
          </header>
          <hr />

        <Grid>
          <Form onSubmit={this.onSubmit}>
            <input 
              type = "file"
              onChange = {this.captureFile}
            />
             <Button className="mgBtn" bsStyle="success"  type="submit">send</Button>

             
          </Form>

          <hr/>
              <Table >
               <thead>
                 <tr>
                   <th>Category</th>
                   <th>Values</th>
                 </tr>
               </thead>
               
                <tbody>
                <tr>
                    <td>Ethereum Contract Address</td>
                    <td>{this.state.ethAddress}</td>
                  </tr>
                  <tr>
                    <td>IPFS Hash stored on Eth Contract</td>
                    <td>{this.state.ipfsHash}</td>
                  </tr>
                  

                  <tr>
                    <td>Transaction Hash  </td>
                    <td>{this.state.transactionHash}</td>
                  </tr>

                  <tr>
                    <td>Block Hash Number </td>
                    <td>{this.state.blockNumber}</td>
                  </tr>

                  <tr>
                    <td>Gas Used</td>
                    <td>{this.state.gasUsed}</td>
                  </tr>                
                </tbody>
            </Table>
            <Button bsStyle="info" onClick = {this.onClick}> transaction information</Button>
        </Grid>
     </div>
      );
    } 
}

export default App;
