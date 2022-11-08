import { Router } from "express";
import * as videoController from "../controllers/videoController";
import * as userController from "../controllers/userController";

const globalRouter = Router();

const handleHome = (req, res, next) => {
  res.render("home");
};
globalRouter.get("/", videoController.home);
globalRouter.get("/join", userController.signup);
globalRouter.get("/login", userController.login);

export default globalRouter;
