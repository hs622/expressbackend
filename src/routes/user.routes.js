import { Router } from "express";
import {
  updateCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resgisterUser
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

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/reissue-access-token").post(verifyJWT, refreshAccessToken);
router.route("/update-password").post(verifyJWT, updateCurrentPassword);

export default router;
