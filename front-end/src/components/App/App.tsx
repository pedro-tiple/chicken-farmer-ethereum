import React from 'react';
import './App.css';
import {BarnRegistrationCenter} from "../BarnRegistrationCenter/BarnRegistrationCenter";
import Web3 from "web3";

interface State {
  web3: Web3;
}

export class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      web3: new Web3("http://localhost:8545"),
    };

    // mine a new block every second TODO only if local env
    setInterval(() => {
      this.state.web3.currentProvider.send({
        params: [],
        jsonrpc: "2.0",
        method: "evm_mine",
        id: new Date().getTime()
      }, () => {});
    }, 1000)
  }


  render() {
    return (
      <div className="app">
        <div className="barn-registration-center-container">
          <BarnRegistrationCenter web3={this.state.web3}/>
        </div>
      </div>
    );
  }
}