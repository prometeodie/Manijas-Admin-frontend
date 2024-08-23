import { Reel } from "./board-reel.interface";
import { ManijometroPoolEntity } from "./manijometro-pool.interface";

export interface Boardgame {
  _id:                 string;
  title:               string;
  categoryGame:        string;
  categoryChips:       string[];
  minPlayers:          number;
  maxPlayers:          number;
  duration:            number;
  manijometroPool:     ManijometroPoolEntity[];
  manijometro:         number;
  gameReview:          string;
  dificulty:           string;
  replayability:       string;
  howToPlayUrl:        string;
  reel:                Reel[];
  section:             string;
  cardCoverImgName:    string;
  imgName:             string[];
  publish:             boolean;
  creationDate?:        Date;
  manijometroPosition: number;
}

