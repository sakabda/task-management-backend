import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import AppError from "../errors/AppError";
import { TJwtPayload } from "../modules/auth/auth.interface";

// Authenticate by Bearer token. Carries the full decoded payload through
// to req.user (including the tenant context fields activeWorkspaceId and
// workspaceRole), so downstream middleware/controllers see the same shape
// that was signed.
//
// `requiredRoles` optionally gates on the GLOBAL User.role
// ("USER" | "ADMIN" | "SUPER_ADMIN"). Workspace-level authorization is done
// separately by requirePermission() — keep these two concerns apart.
const auth = (...requiredRoles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const header = req.headers.authorization;
      const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

      if (!token) {
        throw new AppError(401, "You are not authorized");
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as TJwtPayload & JwtPayload;

      // Spread the full payload so future fields (activeWorkspaceId,
      // workspaceRole, …) flow through automatically instead of being
      // silently dropped by a literal reconstruction.
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        activeWorkspaceId: decoded.activeWorkspaceId,
        workspaceRole: decoded.workspaceRole,
      };

      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        throw new AppError(403, "Forbidden access");
      }

      next();
    } catch (error) {
      // Re-throw operational errors (AppError) unchanged; treat anything
      // else (e.g. jwt.JsonWebTokenError) as a generic 401.
      if (error instanceof AppError) return next(error);
      return next(new AppError(401, "Invalid token"));
    }
  };
};

export default auth;
