export interface CardTemplate{
  _id:string
  title: string;
  imgPath:string;
  isInfoAList:boolean;
  info:Info;
  section:string;
  publish:boolean;
  manijometro?:Number;
  hasVoted?:boolean;
 }


 interface Info{
  eventDate:                  string;
  alternativeTxtEventDate:    string;
  startTime:                  string;
  finishTime:                 string;
  eventPlace:                 string;
 }
