import { NextFunction, Request, Response } from "express";

import { z } from "zod";

const validateRequest = (schema: z.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
