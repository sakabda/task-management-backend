import { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";
import config from "../config";
import AppError from "../errors/AppError";

// Normalize Zod field errors into a flat { field, message }[] payload.
const formatZodErrors = (err: ZodError) =>
  err.issues.map((issue) => ({
    field: issue.path.filter((p) => p !== "body").join(".") || "body",
    message: issue.message,
  }));

const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let details: unknown = undefined;

  // Zod validation → 400 with a structured field list.
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = { errors: formatZodErrors(err) };
  }

  // Prisma known errors → map the common ones to sane HTTP codes.
  if (err?.code === "P2002") {
    statusCode = 409;
    message = "A record with this value already exists";
    details = { target: err.meta?.target };
  } else if (err?.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  // Never leak raw error objects or stack traces in production.
  const isOperational = err instanceof AppError || err instanceof ZodError;

  res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(config.nodeEnv !== "production" && {
      stack: err.stack,
      error: err,
    }),
  });
};

export default globalErrorHandler;
