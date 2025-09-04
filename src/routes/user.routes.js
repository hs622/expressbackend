import { Router } from "express";
import {
  updateCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  resgisterUser,
  updateUsername, 
  updateProfileDetails,
  updateAvatarImage,
  fetchCurrentUser,
} from "../hanlders/user.handler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields("avatar"), resgisterUser);
router.route("/login").post(loginUser);
router.route("/reissue-access-token").post(refreshAccessToken);

// secure routes
router.route("/get-current-user").post(verifyJWT, fetchCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-password").post(verifyJWT, updateCurrentPassword);
router.route("/update-username").post(verifyJWT, updateUsername);
router.route("/update-profile").post(verifyJWT, updateProfileDetails); 
router
  .route("/update-avatar")
  .post(verifyJWT, upload.single("avatar"), updateAvatarImage);

export default router;
