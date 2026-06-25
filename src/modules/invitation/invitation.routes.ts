import { Router } from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { InvitationControllers } from "./invitation.controller";
import { createInvitationValidationSchema } from "./invitation.validation";

const router = Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(createInvitationValidationSchema),
  InvitationControllers.createInvitation,
);

router.get("/", auth("USER", "ADMIN"), InvitationControllers.getInvitations);

// Accept is open to any authenticated user — the token is the secret,
// and the service verifies the invitee email matches the caller.
router.post(
  "/:token/accept",
  auth("USER", "ADMIN"),
  InvitationControllers.acceptInvitation,
);

router.post(
  "/:token/revoke",
  auth("USER", "ADMIN"),
  InvitationControllers.revokeInvitation,
);

export default router;
