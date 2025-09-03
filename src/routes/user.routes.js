import { Router } from "express";
import {
  updateCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resgisterUser,
  updateUsername,
  updateProfileDetails,
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
router.route("/update-username").post(verifyJWT, updateUsername);
router.route("/update-profile").post(verifyJWT, updateProfileDetails);

export default router;
