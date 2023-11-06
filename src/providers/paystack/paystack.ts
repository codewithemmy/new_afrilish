import { IResponse } from "../../constants"
import { IPaymentResponse, transactionStatus } from "../../files/transaction/transaction.interface"
import { transactionMessages } from "../../files/transaction/transaction.messages"
import TransactionRepository from "../../files/transaction/transaction.repository"
import { RequestHandler } from "../../utils/axios.provision"
import { providerMessages } from "../providers.messages"
import { IPaymentProvider } from "./transaction.providers"
import config from "../../core/config"

export default class PaystackPaymentService implements IPaymentProvider {
  private paymentRequestHandler = RequestHandler.setup({
    baseURL: config.PAYSTACK_URL,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${config.PAYSTACK_KEY}`,
      "Accept-Encoding": "gzip,deflate,compress",
    },
  })

  private checkSuccessStatus(
    status: string,
    gatewayResponse: string
  ): {
    success: boolean
    msg: string
  } {
    if (status === "success") return { success: true, msg: gatewayResponse }

    return { success: false, msg: gatewayResponse }
  }

  private async verifySuccessOfPayment(payload: Record<any, any>) {
    const statusVerification = this.checkSuccessStatus(
      payload.status,
      payload.gateway_response
    )

    let responseStatus = "pending" as transactionStatus
    if (statusVerification.success) {
      responseStatus = "confirmed"
    } else {
      responseStatus = "failed"
    }

    const { updatedExisting } =
      await TransactionRepository.updateTransactionDetails(
        { reference: payload.reference },
        { status: responseStatus, metaData: JSON.stringify(payload) }
      )

    if (!updatedExisting)
      return { success: false, msg: transactionMessages.PAYMENT_FAILURE }

    return { success: statusVerification.success, msg: statusVerification.msg }
  }

  async initiatePayment(paymentPayload: {
    amount: number
    email: string
  }): Promise<IPaymentResponse> {
    const { email } = paymentPayload

    const initialAmount = paymentPayload.amount * 100

    const paystackResponse = await this.paymentRequestHandler({
      method: "POST",
      url: "/transaction/initialize",
      data: {
        amount: initialAmount,
        email,
      },
    })

    if (!paystackResponse.status)
      return { success: false, msg: providerMessages.INITIATE_PAYMENT_FAILURE }

    const paystackData = paystackResponse.data.data

    const response = {
      authorizationUrl: paystackData.authorization_url,
      accessCode: paystackData.access_code,
      reference: paystackData.reference,
    }

    return {
      success: true,
      msg: providerMessages.INITIATE_PAYMENT_SUCCESS,
      data: response,
    }
  }

  async verifyCardPayment(
    payload: Record<any, any>
  ): Promise<IPaymentResponse> {
    //check success of transaction
    const { data } = payload
    const transaction =
      await TransactionRepository.findSingleTransactionByParams(
        {
          reference: data.reference,
        },
        {}
      )

    if (!transaction?._id)
      return { success: false, msg: transactionMessages.TRANSACTION_NOT_FOUND }

    if (transaction?.status === "confirmed")
      return { success: false, msg: transactionMessages.DUPLICATE_TRANSACTION }

    const verifyAndUpdateTransactionRecord = await this.verifySuccessOfPayment(
      data
    )

    if (!verifyAndUpdateTransactionRecord.success) {
      return { success: false, msg: verifyAndUpdateTransactionRecord.msg }
    }

    return { success: true, msg: transactionMessages.PAYMENT_SUCCESS }
  }

  async verifyProviderPayment(reference: string): Promise<IResponse> {
    const { data: response } = (await this.paymentRequestHandler({
      method: "GET",
      url: `/transaction/verify/${reference}`,
    })) as any

    if (response.status && response.message == "Verification successful") {
      return this.verifyCardPayment(response)
    }

    return { success: false, msg: response.message }
  }
}
