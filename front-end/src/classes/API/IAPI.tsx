import {ChickenType} from "../../components/Chicken/Chicken";

export default interface IAPI {
  registerNewBarn(): Promise<boolean>;
  buyChicken(barnId: string): Promise<boolean>;
  buyFeed(barnId: string): Promise<boolean>;
  feedChicken(barnId: string, chickenBarcode: number): Promise<boolean>;

  getBarns(): Promise<Array<string>>;
  getBarnCostInGoldEggs(): Promise<number>
  getGoldenEggs(): Promise<number>;
  getChickens(barnId: string): Promise<Array<ChickenType>>;
  getAvailableFeed(barnId: string): Promise<number>;
}