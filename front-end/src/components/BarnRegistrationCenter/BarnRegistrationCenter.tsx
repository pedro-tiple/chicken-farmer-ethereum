import Web3 from 'web3';
import React from 'react';
import './BarnRegistrationCenter.scss';
import barnRegistrationCenterABI from '../../contracts/BarnRegistrationCenter.json';
import barnABI from '../../contracts/Barn.json';
import {Barn} from "../Barn/Barn";

interface Props {
  web3: Web3;
}

interface State {
  barns: Array<string>;
  goldEggCount: number;
  balance: string;
  block: number;
  accounts: Array<string>;
  barnRegistrationCenterContract: any;
  error?: string;
}

export class BarnRegistrationCenter extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      barns: [],
      goldEggCount: 0,
      balance: "0",
      block: 0,
      accounts: [],
      barnRegistrationCenterContract: undefined,
    };

    // This binding is necessary to make `this` work on the callbacks
    this.registerBarn = this.registerBarn.bind(this);
    this.showError = this.showError.bind(this);
    this.updateStats = this.updateStats.bind(this);
  }

  async componentDidMount() {
    let accounts = await this.props.web3.eth.getAccounts();

    // hardcoded contract address generated from migration when running > ganache-cli -d
    let barnRegistrationCenterContract = new this.props.web3.eth.Contract(
      barnRegistrationCenterABI.abi,
      '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
      { from: accounts[0] }
    );

    this.setState({
      accounts,
      barnRegistrationCenterContract,
    });

    this.updateStats();

    // fetch the block every second
    setInterval(() => {
      this.getCurrentBlock();
    }, 1000)
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
    let balance = await this.props.web3.eth.getBalance(this.state.accounts[0]);
    this.setState({
      balance: this.props.web3.utils.fromWei(balance)
    });
  }

  async getCurrentBlock() {
    this.setState({
      block: await this.props.web3.eth.getBlockNumber()
    });
  }

  updateStats() {
    this.getBarns();
    this.getGoldenEggs();
    this.getBalance();
    this.getCurrentBlock();
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
    if (this.state.barns.length > 0 && Number(this.state.goldEggCount) < await this.state.barnRegistrationCenterContract.methods.barnCostInGoldEggs().call()) {
      this.showError("Not enough gold eggs!");
      return
    }

    new this.props.web3.eth.Contract(barnABI.abi).deploy({
      data: barnABI.bytecode,
      arguments: [this.state.barnRegistrationCenterContract.options.address]
    })
      .send({
        from: this.state.accounts[0],
        gas: 810000 // got this from deploying the contract manually
      })
      .on('receipt', (receipt: any) => {
        this.state.barnRegistrationCenterContract.methods.registerBarn(receipt.contractAddress)
          .send()
          .then(() => {
            this.updateStats();
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
          <span><label>Day:</label> { this.state.block }</span>
          <span><label>ETH:</label> { this.state.balance }</span>
          <span><label>Golden Eggs:</label> { this.state.goldEggCount }</span>
          <button onClick={this.registerBarn}>Buy Barn</button>

          {this.state.error &&
            <span className="error">{this.state.error}</span>
          }
        </div>
        <div className="barns">
          {this.state.barns.map((barnAddress, key) =>
            <Barn
              barnAddress={barnAddress}
              key={key}
              web3={this.props.web3}
              onUpdate={this.updateStats}
              onError={this.showError}
            />
          )}
        </div>
      </div>
    );
  }
}