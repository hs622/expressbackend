import { Router } from "express";
import {
  loginUser,
  logoutUser,
  resgisterUser,
} from "../hanlders/user.handler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  resgisterUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
