import { ManijometroPoolEntity } from "../boards interfaces/manijometro-pool.interface";
import { Info } from "./info.interface";

export interface CardTemplate{
  _id:string
  title?: string;
  imgName: string;
  imgMobileName: string;
  isInfoAList?:boolean;
  info?:Info;
  text?:string;
  section:string;
  publish:boolean;
  manijometroPosition?:Number;
  manijometroPool?:ManijometroPoolEntity[];
  roulette?:boolean;
  hasVoted?:boolean;
 }

