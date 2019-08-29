import React from 'react';
import {Barn} from "../Barn/Barn";
import './BarnRegistrationCenter.scss';
import IAPI from "../../classes/API/IAPI";
import EthereumAPI from "../../classes/API/EthereumAPI";

interface Props {
  api: IAPI;
}

interface State {
  barns: Array<string>;
  goldEggCount: number;
  balance: string;
  block: number;
  error?: string;
	barnCostInGoldEggs: number;
}

export class BarnRegistrationCenter extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      barns: [],
      goldEggCount: 0,
      balance: "0",
      block: 0,
			barnCostInGoldEggs: 0,
    };

    // This binding is necessary to make `this` work on the callbacks
    this.registerBarn = this.registerBarn.bind(this);
    this.showError = this.showError.bind(this);
    this.updateStats = this.updateStats.bind(this);
  }

  async componentDidMount() {

    await this.updateStats();

		this.setState({
			barnCostInGoldEggs: await this.props.api.getBarnCostInGoldEggs()
		});

    // fetch the block every second
    setInterval(() => {
      this.getCurrentBlock();
    }, 1000)
  }

  async getCurrentBlock() {
		// voodoo magic to let use proper casting
		const ethAPI = this.props.api as unknown as EthereumAPI;
		this.setState({
			block: await ethAPI.getBlockNumber()
		});
  }

  async updateStats() {
		// voodoo magic to let use proper casting
		const ethAPI = this.props.api as unknown as EthereumAPI;
		this.setState({
			barns: await this.props.api.getBarns(),
			goldEggCount: await this.props.api.getGoldenEggs(),
			balance: await ethAPI.getBalance(),
			block: await ethAPI.getBlockNumber()
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
    if (this.state.barns.length > 0 && Number(this.state.goldEggCount) < this.state.barnCostInGoldEggs) {
      this.showError("Not enough gold eggs!");
      return
    }

    if (await this.props.api.registerNewBarn()) {
			this.updateStats();
		} else {
			this.showError("Couldn't register the barn! Make sure you have enough ETH and gold eggs!");
		}
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
              api={this.props.api}
              onUpdate={this.updateStats}
              onError={this.showError}
            />
          )}
        </div>
      </div>
    );
  }
}