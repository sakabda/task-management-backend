import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { CommentServices } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.createCommentIntoDB(
    req.params.taskId as string,
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getComments = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.getCommentsByTaskId(
    req.params.taskId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comments retrieved successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.updateCommentIntoDB(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.deleteCommentFromDB(
    req.params.id as string,
    req.user!.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
