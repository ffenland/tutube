import { Router } from "express";
import * as videoController from "../controllers/videoController.js";
import { protectorMiddleware, videoUpload } from "../middlewares.js";

const router = Router();
router
  .route("/upload")
  .all(protectorMiddleware)
  .get(videoController.getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    videoController.postUpload
  );
router.get("/:id([0-9a-f]{24})", videoController.watch);
router
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(videoController.getEdit)
  .post(videoController.postEdit);
router
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(videoController.deleteVideo);

export default router;
