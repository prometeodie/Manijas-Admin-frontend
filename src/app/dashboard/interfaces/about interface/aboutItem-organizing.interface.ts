import { SignedImgUrl } from "../others/signed-img-url.interface";

export interface AboutItemOrganizing {
  _id: string;
  text: string;
  img: string;
  imgUrl?: SignedImgUrl;
}
