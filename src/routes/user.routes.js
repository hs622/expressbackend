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
  updateContactDetails,
  getWatchHistory,
  getUserChannelProfile,
} from "../hanlders/user.handler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), resgisterUser);
router.route("/login").post(loginUser);
router.route("/reissue-access-token").post(refreshAccessToken);

// secure routes
router.route("/get-current-user").get(verifyJWT, fetchCurrentUser);
router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-password").patch(verifyJWT, updateCurrentPassword);
router.route("/update-username").patch(verifyJWT, updateUsername);
router.route("/update-profile").patch(verifyJWT, updateProfileDetails);
router.route("/update-contact").patch(verifyJWT, updateContactDetails);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);

// administrator route
router.route("/suspend-status").post(verifyJWT);
router.route("/suspend-account").post(verifyJWT);

export default router;
