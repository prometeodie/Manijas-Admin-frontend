import { UrlWithDate } from "./local-storage-item.interface";

export interface LocalStorageItems {
  _id: string;
  cardCoverImgUrl?: UrlWithDate[];
  cardCoverImgUrlMovile?: UrlWithDate[];
  imgUrl?: UrlWithDate[];
  imgUrlMovile?: UrlWithDate[];
}
