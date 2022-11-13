import { Router } from "express";
import * as videoController from "../controllers/videoController";
import * as userController from "../controllers/userController";

const rootRouter = Router();

rootRouter.get("/", videoController.home);
rootRouter
  .route("/signup")
  .get(userController.getSignup)
  .post(userController.postSignup);
rootRouter
  .route("/login")
  .get(userController.getLogin)
  .post(userController.postLogin);
rootRouter.get("/search", videoController.search);

export default rootRouter;
