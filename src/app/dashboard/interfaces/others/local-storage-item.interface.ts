export interface LocalStorageSetItem {
  _id: string;
  cardCoverImgUrl?: string;
  cardCoverImgUrlMovile?: string;
  imgUrl?: string;
  imgUrlMovile?: string;
  urlDate: Date;
}

export interface UrlWithDate {
  url: string;
  urlDate: Date;
}
