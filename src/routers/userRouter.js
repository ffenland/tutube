import { Router } from "express";
import * as userController from "../controllers/userController";

const router = Router();

router.get("/logout", userController.logout);
router.get("/edit", userController.edit);
router.get("/remove", userController.remove);
router.get(":id", userController.see);

export default router;
