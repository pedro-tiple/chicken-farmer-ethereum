import Web3 from "web3";
import IAPI from "./IAPI";
import barnRegistrationCenterABI from "../../contracts/BarnRegistrationCenter.json";
import barnABI from "../../contracts/Barn.json";
import {ChickenType} from "../../components/Chicken/Chicken";

export default class EthereumAPI implements IAPI {
  private web3: Web3;
  private account: string = "";
  private barnRegistrationCenterContract: any = undefined;

  constructor () {
    // TODO support other environments
    this.web3 = new Web3("http://localhost:8545");
  }

  async setup(brcAddress: string) {
    const accounts = await this.web3.eth.getAccounts();
    this.account = accounts[0];

    this.barnRegistrationCenterContract = new this.web3.eth.Contract(
      barnRegistrationCenterABI.abi,
      brcAddress,
      { from: this.account }
    );

    // mine a new block every second TODO only if local env
    setInterval(() => {
      this.web3.currentProvider.send({
        params: [],
        jsonrpc: "2.0",
        method: "evm_mine",
        id: new Date().getTime()
      }, () => {});
    }, 1000)
  }

  registerNewBarn(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      new this.web3.eth.Contract(barnABI.abi).deploy({
        data: barnABI.bytecode,
        arguments: [this.barnRegistrationCenterContract.options.address]
      })
        .send({
          from: this.account,
          gas: 810000 // got this from deploying the contract manually
        })
        .on('receipt', (receipt: any) => {
          this.barnRegistrationCenterContract.methods.registerBarn(receipt.contractAddress)
            .send()
            .then(() => resolve(true))
            .catch(() => {
              resolve(false);
              // TODO reuse the deployed barn on the next registration attempt
            });
        })
        .catch(() => resolve(false))
    });
  }

  private setupBarnContract(contractAddress: string) {
    return new this.web3.eth.Contract(
      barnABI.abi,
      contractAddress,
      { from: this.account }
    );
  }

  buyChicken(barnId: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.setupBarnContract(barnId).methods.newChicken()
        .send()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    });
  }

  buyFeed(barnId: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.setupBarnContract(barnId).methods.buyFeed()
        .send()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    });
  }

  feedChicken(barnId: string, chickenBarcode: number): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.setupBarnContract(barnId).methods.feedChicken(chickenBarcode)
        .send()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    });
  }

  getBarns(): Promise<Array<string>> {
    return this.barnRegistrationCenterContract.methods.getOwnedBarns().call();
  }

  getBarnCostInGoldEggs(): Promise<number> {
    return this.barnRegistrationCenterContract.methods.barnCostInGoldEggs().call();
  }

  getGoldenEggs(): Promise<number> {
    return this.barnRegistrationCenterContract.methods.getGoldEggCount().call();
  }

  getChickens(barnId: string): Promise<Array<ChickenType>> {
    return new Promise<Array<ChickenType>>(async resolve => {
      const barnContract = this.setupBarnContract(barnId);
      const chickenCount = await barnContract.methods.getChickenCount().call();
      let chickens: Array<ChickenType> = [];
      for (let i = 0; i < chickenCount; i++) {
        chickens.push(await barnContract.methods.chickens(i).call());
      }

      resolve(chickens);
    });
  }

  getAvailableFeed(barnId: string): Promise<number> {
    return this.setupBarnContract(barnId).methods.availableFeed().call();
  }

  async getBalance(): Promise<string> {
    return this.web3.utils.fromWei(
      await this.web3.eth.getBalance(this.account)
    );
  }

  async getBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
  }

}