import express from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import {
  createCommentValidationSchema,
  updateCommentValidationSchema,
} from "./comment.validation";

import { CommentControllers } from "./comment.controller";

const router = express.Router();

router.post(
  "/:taskId",
  auth("USER", "ADMIN"),
  validateRequest(createCommentValidationSchema),
  CommentControllers.createComment,
);

router.get(
  "/:taskId",
  auth("USER", "ADMIN"),
  CommentControllers.getComments,
);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateCommentValidationSchema),
  CommentControllers.updateComment,
);

router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  CommentControllers.deleteComment,
);

export const CommentRoutes = router;
