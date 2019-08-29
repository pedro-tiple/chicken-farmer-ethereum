import React from 'react';
import './App.css';
import {BarnRegistrationCenter} from "../BarnRegistrationCenter/BarnRegistrationCenter";
import IAPI from "../../classes/API/IAPI";
import EthereumAPI from "../../classes/API/EthereumAPI";

interface State {
  api?: IAPI;
}

export class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);

    this.state = {};

    const api = new EthereumAPI();
    // hardcoded contract address generated from migration when running > ganache-cli -d
    api.setup("0xCfEB869F69431e42cdB54A4F4f105C19C080A601").then(() => {
      this.setState({api});
    })
  }


  render() {
    return (
      <div className="app">
        <div className="barn-registration-center-container">
          {this.state.api &&
            <BarnRegistrationCenter api={this.state.api}/>
          }
        </div>
      </div>
    );
  }
}