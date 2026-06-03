import jwt, { Secret, SignOptions } from "jsonwebtoken";

import { TJwtPayload } from "../modules/auth/auth.interface";

export const createToken = (
  payload: TJwtPayload,
  secret: Secret,
  expiresIn: string,
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};
