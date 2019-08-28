import React from 'react';
import './Barn.scss';
import Web3 from "web3";
import barnABI from "../../contracts/Barn.json";
import {Chicken, ChickenType} from "../Chicken/Chicken";

interface Props {
  barnAddress: string;
  web3: Web3;
  onError?: Function;
  onUpdate?: Function;
}

interface State {
  chickens: Array<ChickenType>;
  feed: number;
  barnContract: any;
}

export class Barn extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      chickens: [],
      feed: 0,
      barnContract: undefined,
    };
  }

  async componentDidMount() {
    let accounts = await this.props.web3.eth.getAccounts();

    let barnContract = new this.props.web3.eth.Contract(
      barnABI.abi,
      this.props.barnAddress,
      { from: accounts[0] }
    );

    this.setState({barnContract});
    
    this.getChickens();
    this.getFeed();

    // This binding is necessary to make `this` work on the callbacks
    this.buyChicken = this.buyChicken.bind(this);
    this.buyFeed = this.buyFeed.bind(this);
    this.feedChicken = this.feedChicken.bind(this);
  }

  async getChickens() {
    const chickenCount = await this.state.barnContract.methods.getChickenCount().call();
    let chickens: Array<ChickenType> = [];
    for (let i = 0; i < chickenCount; i++) {
      chickens.push(await this.state.barnContract.methods.chickens(i).call());
    }
    this.setState({
      chickens
    });
  }

  async getFeed() {
    const feed = await this.state.barnContract.methods.availableFeed().call();
    this.setState({
      feed
    });
  }

  async buyChicken() {
    this.state.barnContract.methods.newChicken()
      .send()
      .then(() => {
        this.props.onUpdate && this.props.onUpdate();
        this.getChickens();
      })
      .catch(() => {
        this.props.onError && this.props.onError("Couldn't buy chicken! Make sure you have enough ETH and gold eggs!");
      });
  }

  async buyFeed() {
    this.state.barnContract.methods.buyFeed()
      .send()
      .then(() => {
        this.props.onUpdate && this.props.onUpdate();
        this.getFeed();
      })
      .catch(() => {
        this.props.onError && this.props.onError("Couldn't buy feed! Make sure you have enough ETH and gold eggs!");
      });
  }

  async feedChicken(chickenBarcode: number) {
    this.state.barnContract.methods.feedChicken(chickenBarcode)
      .send()
      .then(() => {
        this.props.onUpdate && this.props.onUpdate();
        this.getChickens();
        this.getFeed();
      })
      .catch(() => {
        this.props.onError && this.props.onError("Couldn't feed chicken! Make sure you have enough ETH, gold eggs, and the chicken is ready to feed!");
      });
  }

  render() {
    return (
      <div className="barn">
        <img src="barn.png" alt="barn" width="200"/>
        <div className="stats">
          <span><label>Feed:</label> { this.state.feed }</span>
          <span><label>Chickens:</label> { this.state.chickens.length }</span>
        </div>
        <div className="actions">
          <button onClick={this.buyFeed}>Buy Feed</button>
          <button onClick={this.buyChicken}>Buy Chicken</button>
        </div>
        <div className="chickens">
          {this.state.chickens.map((chicken, key) =>
            <Chicken
              key={key}
              web3={this.props.web3}
              chicken={chicken}
              barcode={key}
              onFeed={this.feedChicken}
            />
          )}
        </div>
      </div>
    );
  }
}
