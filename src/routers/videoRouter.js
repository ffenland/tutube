import { Router } from "express";
import * as videoController from "../controllers/videoController";

const router = Router();
router
  .route("/upload")
  .get(videoController.getUpload)
  .post(videoController.postUpload);
router.get("/:id([0-9a-f]{24})", videoController.watch);
router
  .route("/:id([0-9a-f]{24})/edit")
  .get(videoController.getEdit)
  .post(videoController.postEdit);
router.route("/:id([0-9a-f]{24})/delete").get(videoController.deleteVideo);

export default router;
