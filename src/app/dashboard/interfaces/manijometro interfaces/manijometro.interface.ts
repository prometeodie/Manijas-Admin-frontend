import { SignedImgUrl } from "../others/signed-img-url.interface";

export interface Manijometro {
  _id:               string;
  title:            string;
  manijometroPool:  ManijometroPool[];
  manijometroPosition:      number;
  cardCoverImgName: string;
  imgUrl?: SignedImgUrl
}

export interface ManijometroPool {
  userId:                    string;
  manijometroValuesPool:     ManijometroValuesPool;
  totalManijometroUserValue: number;
}

export interface ManijometroValuesPool {
  priceQuality:number;
  gameplay:number;
  replayability:number;
  gameSystemExplanation:number;
}
