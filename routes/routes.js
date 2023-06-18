import express from "express";

/** file from controller */

import * as controller from "../controller/userController.js";
import { auth, localVariables } from "../middleware/auth.js";
import { registerMail } from "../controller/mailer.js";

/**router methods */

const router = express.Router();

/** POST router */

router.post("/register", controller.register);
router.post("/registerMail", registerMail);
router.post("/authenticate", controller.verifyUser, controller.authenticate);
router.post("/login", controller.verifyUser, controller.login);

/** GET router */

router.get("/user/:username", controller.getUser);
router.get(
  "/generateOTP",
  controller.verifyUser,
  localVariables,
  controller.generateOTP
);
router.get("/verifyOTP", controller.verifyUser, controller.verifyOTP);
router.get("/createResetSession", controller.createResetSession);

/** PUT router */

router.put("/updateUser", auth, controller.updateUser);
router.put("/resetPassword", controller.verifyUser, controller.resetPassword);

export default router;
