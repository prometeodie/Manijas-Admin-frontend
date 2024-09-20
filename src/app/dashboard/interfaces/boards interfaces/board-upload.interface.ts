import { Section } from "../others/sections.enum";
import { CategoryGame } from "./board-category.enum";
import { Reel } from "./board-reel.interface";
import { Dificulty } from "./dificulty.enum";
import { Replayability } from "./replayability.enum";


export interface BoardgameUpload {
  section:        string,
  title:          string;
  categoryGame:   CategoryGame;
  categoryChips:  string[];
  minPlayers:     number,
  maxPlayers:     number,
  duration:       number,
  gameReview:     string,
  dificulty:      Dificulty,
  replayability:  Replayability,
  howToPlayUrl:   string,
  reel:           Reel[],
  imgName:        string[],
  publish:        boolean
}
