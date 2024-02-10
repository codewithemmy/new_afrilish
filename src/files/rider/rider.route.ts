import express from "express"
import riderController from "./riderController/rider.controller"
import riderProfileController from "./riderController/riderProfile.controller"
import { isAuthenticated } from "../../utils"
import uploadManager from "../../utils/multer"

const RiderRouter = express.Router()

const {
  createRiderController,
  resendOtpController,
  verifyRiderController,
  loginRiderController,
  forgotPasswordController,
  changePasswordController,
  resetPasswordController,
} = riderController

const {
  riderProfile,
  riderProfileUPdate,
  deleteRiderProfile,
  riderDocumentUpload,
  getOrderCoordController,
  getRiderController,
} = riderProfileController

//routes
RiderRouter.post(
  "/",
  uploadManager("image").single("image"),
  createRiderController,
)

RiderRouter.post("/verify", verifyRiderController)
RiderRouter.post("/login", loginRiderController)
RiderRouter.post("/forgot-password", forgotPasswordController)
RiderRouter.post("/reset-password", resetPasswordController)
RiderRouter.post("/resend-otp", resendOtpController)
RiderRouter.delete("/:id", deleteRiderProfile)

RiderRouter.use(isAuthenticated)
RiderRouter.post("/change-password", changePasswordController)

//rider profile
RiderRouter.get("/", riderProfile)
RiderRouter.patch(
  "/",
  uploadManager("image").single("image"),
  riderProfileUPdate,
)

RiderRouter.patch(
  "/document",
  uploadManager("document").single("image"),
  riderDocumentUpload,
)

RiderRouter.get("/order", getOrderCoordController)
RiderRouter.get("/all", getRiderController)

export default RiderRouter
