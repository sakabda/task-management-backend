import bcrypt from "bcryptjs";

import prisma from "../../prisma/prisma";

import AppError from "../../errors/AppError";

import { createToken } from "../../utils/jwt";

import { TLoginUser, TRegisterUser, TJwtPayload } from "./auth.interface";

const registerUserIntoDB = async (payload: TRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const result = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return result;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Password does not match");
  }

  const jwtPayload: TJwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    process.env.JWT_SECRET as string,
    process.env.JWT_EXPIRES_IN as string,
  );

  return {
    accessToken,
  };
};

const getMe = async (payload: TJwtPayload) => {
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const AuthServices = {
  registerUserIntoDB,
  loginUser,
  getMe,
};
