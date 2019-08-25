import Web3 from 'web3';
import React from 'react';
import './BarnRegistrationCenter.scss';
import barnRegistrationCenterABI from '../../contracts/BarnRegistrationCenter.json';
import barnABI from '../../contracts/Barn.json';
import {Barn} from "../Barn/Barn";
import Contract from "web3/eth/contract";

export interface Props {
}

export interface State {
  barns: Array<object>;
  goldEggCount: number;
  balance: string;
  accounts: Array<string>;
  web3: Web3;
  barnRegistrationCenterContract: Contract;
  error?: string;
}

export class BarnRegistrationCenter extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      barns: [],
      goldEggCount: 0,
      balance: "0",
      accounts: [],
      web3: new Web3("http://localhost:8545"),
      barnRegistrationCenterContract: new Contract(["dummy"]),
    };

    // This binding is necessary to make `this` work in the callback
    this.registerBarn = this.registerBarn.bind(this);
  }

  async componentDidMount() {
    let accounts = await this.state.web3.eth.getAccounts();

    // hardcoded contract address generated from migration when running > ganache-cli -d
    let barnRegistrationCenterContract = new Contract(
      barnRegistrationCenterABI.abi,
      '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
      { from: accounts[0] }
    );

    this.setState({
      accounts,
      barnRegistrationCenterContract,
    });

    this.getBarns();
    this.getGoldenEggs();
    this.getBalance();
  }

  async getBarns() {
    let barns = await this.state.barnRegistrationCenterContract.methods.getOwnedBarns().call();
    this.setState({
      barns
    });
  }

  async getGoldenEggs() {
    let goldEggCount = await this.state.barnRegistrationCenterContract.methods.getGoldEggCount().call();
    this.setState({
      goldEggCount
    });
  }

  async getBalance() {
    let balance = await this.state.web3.eth.getBalance(this.state.accounts[0]);
    this.setState({
      balance: this.state.web3.utils.fromWei(balance)
    });
  }

  showError(errorMessage: string) {
    this.setState({
      error: errorMessage
    });

    setTimeout(() => {
      this.setState({
        error: undefined
      });
    }, 5000)
  }

  async registerBarn() {
    if (Number(this.state.goldEggCount) < await this.state.barnRegistrationCenterContract.methods.barnCostInGoldEggs().call()) {
      this.showError("Not enough gold eggs!");
      return
    }

    new this.state.web3.eth.Contract(barnABI.abi).deploy({
      data: barnABI.bytecode,
      arguments: [this.state.barnRegistrationCenterContract.options.address]
    })
      .send({
        from: this.state.accounts[0],
        gas: 791000 // got this from deploying the contract manually
      })
      .on('receipt', (receipt: any) => {
        this.state.barnRegistrationCenterContract.methods.registerBarn(receipt.contractAddress)
          .send()
          .then(() => {
            this.getBarns();
          })
          .catch(() => {
            // TODO reuse the deployed barn on the next registration attempt
            this.showError("Couldn't register the barn! Make sure you have enough ETH and gold eggs!");
          });
      });
  }

  render() {
    return (
      <div className="barn-registration-center">
        <div className="owner-info">
          <h1>My Farm</h1>
          <span><label>ETH:</label> { this.state.balance }</span>
          <span><label>Golden Eggs:</label> { this.state.goldEggCount }</span>
          <button onClick={this.registerBarn}>Buy Barn</button>
          <button>Buy Feed</button>

          {this.state.error &&
            <span className="error">{this.state.error}</span>
          }
        </div>
        <div className="barns">
          {this.state.barns.map((barn, key) =>
            <Barn barn={barn} key={key} />
          )}
        </div>
      </div>
    );
  }
}