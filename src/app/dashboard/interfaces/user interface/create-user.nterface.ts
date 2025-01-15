import { Roles } from "./roles.enum";

  export interface CreateUser {
    email: string;
    name: string;
    surname: string;
    nickname: string;
    password: string;
    roles?: string;
  }
