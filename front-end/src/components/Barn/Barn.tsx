import React from 'react';
import './Barn.scss';
import IAPI from "../../classes/API/IAPI";
import {Chicken, ChickenType} from "../Chicken/Chicken";

interface Props {
  barnAddress: string;
  api: IAPI;
  onError?: Function;
  onUpdate?: Function;
}

interface State {
  chickens: Array<ChickenType>;
  feed: number;
}

export class Barn extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      chickens: [],
      feed: 0,
    };
  }

  async componentDidMount() {

    this.getChickens();
    this.getFeed();

    // This binding is necessary to make `this` work on the callbacks
    this.buyChicken = this.buyChicken.bind(this);
    this.buyFeed = this.buyFeed.bind(this);
    this.feedChicken = this.feedChicken.bind(this);
  }

  async getChickens() {
    this.setState({
      chickens: await this.props.api.getChickens(this.props.barnAddress)
    });
  }

  async getFeed() {
    this.setState({
      feed: await this.props.api.getAvailableFeed(this.props.barnAddress)
    });
  }

  async buyChicken() {
		if (await this.props.api.buyChicken(this.props.barnAddress)) {
			this.props.onUpdate && this.props.onUpdate();
			this.getChickens();
		} else {
			this.props.onError && this.props.onError("Couldn't buy chicken! Make sure you have enough ETH and gold eggs!");
		}
  }

  async buyFeed() {
		if (await this.props.api.buyFeed(this.props.barnAddress)) {
			this.props.onUpdate && this.props.onUpdate();
			this.getFeed();
		} else {
			this.props.onError && this.props.onError("Couldn't buy feed! Make sure you have enough ETH and gold eggs!");
		}
  }

  async feedChicken(chickenBarcode: number) {
		if (await this.props.api.feedChicken(this.props.barnAddress, chickenBarcode)) {
			this.props.onUpdate && this.props.onUpdate();
			this.getChickens();
			this.getFeed();
		} else {
			this.props.onError && this.props.onError("Couldn't feed chicken! Make sure you have enough ETH, gold eggs, and the chicken is ready to feed!");
		}
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
              api={this.props.api}
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
