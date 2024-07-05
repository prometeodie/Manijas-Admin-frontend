export interface CardTemplate{
  id:string
  title: string;
  imgPath:string;
  isInfoAList:boolean;
  info:string[];
  category:string;
  publish:boolean;
  manijometro?:Number;
  hasVoted?:boolean;
 }
