import { Router } from "express";
import * as userController from "../controllers/userController.js";
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from "../middlewares.js";

const router = Router();

router.get("/logout", protectorMiddleware, userController.logout);
router
  .route("/edit")
  .all(protectorMiddleware)
  .get(userController.getEdit)
  .post(avatarUpload.single("avatar"), userController.postEdit);
router
  .route("/change-password")
  .all(protectorMiddleware)
  .get(userController.getChangePassword)
  .post(userController.postChangePassword);
router.get(
  "/github/start",
  publicOnlyMiddleware,
  userController.startGithubLogin
);
router.get(
  "/github/callback",
  publicOnlyMiddleware,
  userController.callbackGithubLogin
);
router.get("/testusermaker", userController.testUserMaker);
router.get("/:id", userController.see);

export default router;
