import { Reel } from "./board-reel.interface";

export interface BoardgameUpload {
  section?:          string,
  title?:            string;
  categoryGame?:     string;
  categoryChips?:    string[];
  minPlayers?:       number,
  maxPlayers?:       number,
  minAge?:           number,
  duration?:         number,
  gameReview?:       string,
  dificulty?:        string,
  replayability?:    string,
  howToPlayUrl?:     string,
  reel?:             Reel[],
  imgName?:          string[],
  cardCoverImgName?: string;
  publish?:          boolean
}





