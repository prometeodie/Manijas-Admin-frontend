export interface Manijometro {
  _id:               string;
  title:            string;
  manijometroPool:  ManijometroPool[];
  manijometroPosition:      number;
  cardCoverImgName: string;
}

export interface ManijometroPool {
  userId:                    string;
  manijometroValuesPool:     ManijometroValuesPool;
  totalManijometroUserValue: number;
}

export interface ManijometroValuesPool {
  value1: number;
  value2: number;
  value3: number;
  value4: number;
  value5: number;
}
