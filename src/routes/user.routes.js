import { Router } from "express";
import { resgisterUser } from "../hanlders/user.handler.js";

const router = Router();

router.route("/register").post(resgisterUser);

export default router;
