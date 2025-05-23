import { Section } from "../others/sections.enum";
import { Reel } from "./board-reel.interface";
import { ManijometroPoolEntity } from "./manijometro-pool.interface";

export interface Boardgame {
  _id:                   string;
  title:                 string;
  categoryGame:          string;
  categoryChips:         string[];
  minPlayers:            number | null | undefined;
  maxPlayers:            number;
  minAge:                number;
  duration:              number;
  manijometroPool:       ManijometroPoolEntity[];
  manijometro:           number;
  gameReview:            string;
  dificulty:             string;
  replayability:         string;
  howToPlayUrl:          string;
  reel:                  Reel[];
  section:               Section.BOARDGAMES;
  cardCoverImgName:      string;
  cardCoverImgNameMobile:string;
  imgName:               string[];
  imgNameMobile:         string[];
  roulette:              boolean;
  publish:               boolean;
  creationDate?:         Date;
  manijometroPosition?:  number;
}
