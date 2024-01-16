import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../../core/response"
import { fileModifier, manageAsyncOps } from "../../../utils"
import { CustomError } from "../../../utils/error"
import { statusCode } from "../../../constants/statusCode"
import RiderService from "../riderService/riderProfile.service"

class RiderProfileController {
  async riderProfile(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      RiderService.riderProfile(res.locals.jwt._id),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async riderProfileUPdate(req: Request, res: Response, next: NextFunction) {
    const { body, image } = await fileModifier(req)
    const [error, data] = await manageAsyncOps(
      RiderService.updateRiderProfile({
        params: res.locals.jwt._id,
        riderPayload: { ...body, image },
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async deleteRiderProfile(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      RiderService.deleteRider(req.params.id),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async riderDocumentUpload(req: Request, res: Response, next: NextFunction) {
    const { image, body } = await fileModifier(req)
    const [error, data] = await manageAsyncOps(
      RiderService.riderDocumentUpload({ image, body }, res.locals.jwt._id),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }
}

export default new RiderProfileController()
