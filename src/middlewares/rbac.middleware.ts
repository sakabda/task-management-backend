import { NextFunction, Request, Response } from "express";

import AppError from "../errors/AppError";
import { hasPermission, isSuperAdmin } from "../lib/permissions";

// Enforce a permission against the resolved tenant context. Must run
// AFTER auth() + resolveTenant().
//
//   router.post("/", auth(), requireTenant, requirePermission("task.create"), …)
//
// SUPER_ADMIN (global) bypasses the check entirely.
const requirePermission = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Global operators bypass workspace RBAC.
    if (isSuperAdmin(req.user?.role)) {
      return next();
    }

    const granted = req.tenant?.permissions;
    if (!granted) {
      return next(new AppError(403, "No tenant context for permission check"));
    }

    // AND semantics — every requested permission must be granted.
    const allowed = permissions.every((p) => hasPermission(granted, p));

    if (!allowed) {
      return next(
        new AppError(403, `Missing permission: ${permissions.join(", ")}`),
      );
    }

    next();
  };
};

export default requirePermission;
