import { Router } from "express";
import * as videoController from "../controllers/videoController.js";

const apiRouter = Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", videoController.registerView);
apiRouter.post(
  "/videos/:id([0-9a-f]{24})/comment",
  videoController.writeComment
);
apiRouter.post("/videos/:id([0-9a-f]{24})/fav", videoController.addFavorite);
apiRouter.post(
  "/videos/:id([0-9a-f]{24})/commentdelete/:commentId([0-9a-f]{24})",
  videoController.deleteComment
);

export default apiRouter;
