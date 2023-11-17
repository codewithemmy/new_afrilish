import pagination, { IPagination } from "../../constants"
import { ITransaction } from "./transaction.interface"
import Transaction from "./transaction.model"
const { LIMIT, SKIP, SORT } = pagination

export default class TransactionRepository {
  static async create(transactionPayload: Partial<ITransaction>) {
    return Transaction.create(transactionPayload)
  }

  static async findSingleTransactionByParams(
    transactionPayload: Partial<ITransaction>,
    select?: Partial<Record<keyof ITransaction, number | Boolean | object>>,
  ): Promise<ITransaction | null> {
    const transaction: Awaited<ITransaction | null> = await Transaction.findOne(
      {
        ...transactionPayload,
      },
      select,
    )
    return transaction
  }

  static async updateTransactionDetails(
    transactionPayload: Partial<ITransaction> | { $set: Partial<ITransaction> },
    update:
      | Partial<ITransaction>
      | { $push?: Record<any, any>; $set?: Record<any, any> },
  ): Promise<{ updatedExisting?: boolean | undefined }> {
    const { lastErrorObject: response } = await Transaction.findOneAndUpdate(
      {
        ...transactionPayload,
      },
      { ...update },
      { rawResult: true }, //returns details about the update
    )

    return response!
  }

  static async fetchTransactionsByParams(
    transactionPayload: Partial<ITransaction & IPagination>,
  ): Promise<ITransaction[] | []> {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = transactionPayload

    const transactions: Awaited<ITransaction[] | null> = await Transaction.find(
      {
        ...restOfPayload,
      },
    )
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return transactions
  }
}
