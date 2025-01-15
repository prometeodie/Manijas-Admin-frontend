import { Roles } from "./roles.enum";

  export interface UpdateUser {
    email: string;
    name: string;
    surname: string;
    nickname: string;
    password?: string;
    roles?: string;
  }
