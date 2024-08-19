import { Info } from "./info.interface";

export interface CardTemplate{
  _id:string
  title: string;
  imgPath:string;
  imgName: string;
  isInfoAList:boolean;
  info?:Info;
  text?:string;
  section:string;
  publish:boolean;
  manijometro?:Number;
  hasVoted?:boolean;
 }

