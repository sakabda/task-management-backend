export interface TRegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface TLoginUser {
  email: string;
  password: string;
}

export interface TJwtPayload {
  id: string;
  email: string;
  role: string;
}
