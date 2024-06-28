
export interface Message {
  _id:           string;
  fullName:      string;
  email:         string;
  subject:       string;
  message:       string;
  section:       string;
  creationDate:  Date;
  hasBeenReaded: boolean;
  __v:           number;
}
