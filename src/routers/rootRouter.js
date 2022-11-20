import { Router } from "express";
import * as videoController from "../controllers/videoController.js";
import * as userController from "../controllers/userController.js";
import { publicOnlyMiddleware } from "../middlewares.js";

const rootRouter = Router();

rootRouter.get("/", videoController.home);
rootRouter
  .route("/signup")
  .all(publicOnlyMiddleware)
  .get(userController.getSignup)
  .post(userController.postSignup);
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(userController.getLogin)
  .post(userController.postLogin);
rootRouter.get("/search", videoController.search);

export default rootRouter;
