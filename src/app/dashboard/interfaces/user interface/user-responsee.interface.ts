export interface UserResponse {
  _id:      string;
  email:    string;
  name:     string;
  surname:  string;
  nickname: string;
  isActive: boolean;
  roles:    string[];
  __v:      number;
}
