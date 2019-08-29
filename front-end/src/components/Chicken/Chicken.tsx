import React from 'react';
import './Chicken.scss';
import IAPI from "../../classes/API/IAPI";
import EthereumAPI from "../../classes/API/EthereumAPI";

export interface ChickenType {
  blockOfPurchase: number;
  restingUntil: number;
  eggsLaid: number;
  goldEggsLaid: number;
}

enum Action {
  STANDING_LEFT = "standing-left",
  STANDING_RIGHT = "standing-right",
  SITTING_LEFT  = "sitting-left",
  SITTING_RIGHT = "sitting-right",
  FEEDING = "feeding"
}

interface Props {
  api: IAPI;
  chicken: ChickenType;
  barcode: number;
  onFeed?: Function;
}

interface State {
  action: string;
  block: number;
}

export class Chicken extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { action: Action.STANDING_LEFT, block: 0 };
  }

  async componentDidMount() {
    // This binding is necessary to make `this` work on the callbacks
    this.feedChicken = this.feedChicken.bind(this);
    this.checkFeedingState = this.checkFeedingState.bind(this);

    await this.checkFeedingState();
    this.randomizeAction();

    // check if still feeding every second
    setInterval(this.checkFeedingState, 1000);
  }

  async getCurrentBlock() {
    // voodoo magic to let use proper casting
    const ethAPI = this.props.api as unknown as EthereumAPI;
    this.setState({
      block: await ethAPI.getBlockNumber()
    });
  }

  async checkFeedingState() {
    await this.getCurrentBlock();

    if (this.props.chicken.restingUntil >= this.state.block) {
      this.setState({ action: Action.FEEDING });
    } else {
    	// only restart randomizing state if still feeding
      this.state.action === Action.FEEDING && this.randomizeAction(1);
    }
  }

  randomizeAction(timeout?: number) {
    setTimeout(() => {
      // if feeding then stop randomizing, except when timeout is set
      if (this.state.action === Action.FEEDING && timeout === undefined) {
        return
      }

      const actions = Object.values(Action);
      // pick random action except for the last one which should be the feeding one
      this.setState({action: actions[Math.floor(Math.random() * (actions.length - 1))]});
      this.randomizeAction();
    }, timeout || Math.max(2000, Math.random() * 5000)) // random wait between [2s, 5s]
  }

  feedChicken() {
    this.props.onFeed && this.props.onFeed(this.props.barcode);
    this.setState({
      action: Action.FEEDING
    });
  }

  render() {
    return (
      <div className="chicken">
        <div className={`chicken-img ${this.state.action}`}/>
        <div className="chicken-stats">
          <span><img src="cake.gif" alt="birthday" width="30"/> { this.props.chicken.blockOfPurchase }</span>
          <span><img src="egg.png" alt="eggs laid" width="20"/> { this.props.chicken.eggsLaid }</span>
          <span><img src="gold_egg.png" alt="goldeggs laid" width="20"/> { this.props.chicken.goldEggsLaid }</span>
          <span><img src="clock.png" alt="resting until" width="20"/> { Math.max(this.props.chicken.restingUntil - this.state.block, 0) }</span>
        </div>
        <button onClick={this.feedChicken} disabled={this.props.chicken.restingUntil - this.state.block > 0}>Feed</button>
      </div>
  )}
}
