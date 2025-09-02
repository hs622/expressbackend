import { Router } from "express";
import { resgisterUser } from "../hanlders/user.handler.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;
