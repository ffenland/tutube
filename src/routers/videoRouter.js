import { Router } from "express";
import * as videoController from "../controllers/videoController";

const router = Router();

router.get("/:id(\\d+)", videoController.watch);
router
  .route("/:id(\\d+)/edit")
  .get(videoController.getEdit)
  .post(videoController.postEdit);
router
  .route("/upload")
  .get(videoController.getUpload)
  .post(videoController.postUpload);
export default router;
