import { NextFunction, Request, Response } from "express";

import { z } from "zod";

// Validation request shape. The legacy convention is a single zod schema
// shaped as `{ body: z.object({...}) }`. New modules may also pass params
// and query schemas (so path/query validation works alongside body).
type ValidationSchemas = {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
};

const isValidationSchemas = (
  schema: z.ZodSchema | ValidationSchemas,
): schema is ValidationSchemas =>
  typeof schema === "object" &&
  schema !== null &&
  !("parseAsync" in schema) &&
  !("parse" in schema);

// Accepts either:
//   validateRequest({ body: ..., params: ..., query: ... })   // new style
//   validateRequest(z.object({ body: ... }))                  // legacy style
const validateRequest = (schema: z.ZodSchema | ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (isValidationSchemas(schema)) {
        if (schema.body) req.body = await schema.body.parseAsync(req.body);
        if (schema.params) await schema.params.parseAsync(req.params);
        if (schema.query) await schema.query.parseAsync(req.query);
      } else {
        // Legacy: schema wraps everything under { body }. Run it and let
        // its output replace req.body (zod refinements/defaults applied).
        const parsed = await schema.parseAsync({ body: req.body });
        if (parsed && typeof parsed === "object" && "body" in parsed) {
          req.body = (parsed as { body: unknown }).body;
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
