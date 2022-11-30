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
router.get(
  "/kakao/start",
  publicOnlyMiddleware,
  userController.startKakaoLogin
);
router.get(
  "/kakao/callback",
  publicOnlyMiddleware,
  userController.callbackKakaoLogin
);
router.get(
  "/naver/start",
  publicOnlyMiddleware,
  userController.startNaverLogin
);
router.get(
  "/naver/callback",
  publicOnlyMiddleware,
  userController.callbackNaverLogin
);

router.get("/:id", userController.see);

export default router;
