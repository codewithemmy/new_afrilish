import { NextFunction, Response, Request } from "express"
import { responseHandler } from "../../core/response"
import { fileModifier, manageAsyncOps } from "../../utils"
import { CustomError } from "../../utils/error"
import { statusCode } from "../../constants/statusCode"
import PartnerService from "./partner.service"
import VendorService from "./vendor/vendor.service"

class PartnerController {
  async createPartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.createPartner(req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.CREATED, data!)
  }

  async loginPartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.loginPartner(req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async fetchPartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.fetchPartnerService(req.query),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async updatePartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.updatePartner({
        params: req.params as { partnerId: string },
        partnerPayload: req.body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async operationUpdateController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      VendorService.operationUpdateService({
        params: req.params as { vendorId: string },
        vendorPayload: req.body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async fetchSinglePartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.fetchSinglePartnerService(res.locals.jwt._id),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async updatePartnerPasswordController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.resetPassword({
        params: req.params as { partnerId: string },
        payload: req.body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async deleteController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      PartnerService.deletePartnerService({
        params: req.params as { partnerId: string },
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))
    return responseHandler(res, statusCode.CREATED, data!)
  }

  async vendorController(req: Request, res: Response, next: NextFunction) {
    let { image, body } = fileModifier(req)

    const [error, data] = await manageAsyncOps(
      VendorService.createVendor({
        image,
        partnerId: res.locals.jwt._id,
        ...body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async fetchVendorController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      VendorService.fetchVendorService(req.query, res.locals.jwt._id),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async updateVendorController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { image, body } = fileModifier(req)
    const [error, data] = await manageAsyncOps(
      VendorService.updateVendor({
        params: { vendorId: req.params.vendorId },
        vendorPayload: { ...body, image },
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async verifyPartnerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.verifyPartnerService(req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async forgotPasswordController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.forgotPasswordService(req.body),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async resetPasswordController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.resetPasswordService(req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async resendVerificationOtpController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.resendVerificationService(req.body),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async partnerAuthLoginController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      PartnerService.partnerAuthLoginService(req.body),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async updatePaymentController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      VendorService.paymentUpdateService({
        params: req.params as { vendorId: string },
        vendorPayload: req.body,
      }),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async getVendorPaymentController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      VendorService.getVendorPayment(req.params.vendorId as string),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async deleteVendorPaymentController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      VendorService.deleteVendorPaymentDetails(req.params.vendorId as string),
    )
    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async rateVendorController(req: Request, res: Response, next: NextFunction) {
    const [error, data] = await manageAsyncOps(
      VendorService.rateVendorService(req.body, req.params.id as string),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }

  async getVendorAnalysisController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const [error, data] = await manageAsyncOps(
      VendorService.getVendorAnalysis(),
    )

    if (error) return next(error)
    if (!data?.success) return next(new CustomError(data!.msg, 400, data!))

    return responseHandler(res, statusCode.SUCCESS, data!)
  }
}

export default new PartnerController()
