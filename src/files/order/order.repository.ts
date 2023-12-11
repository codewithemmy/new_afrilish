import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IOrder } from "./order.interface"
import Order from "./order.model"

const { LIMIT, SKIP, SORT } = pagination

export default class OrderRepository {
  static async createOrder(orderPayload: Partial<IOrder>): Promise<IOrder> {
    return Order.create(orderPayload)
  }

  static async fetchOrder(
    orderPayload: Partial<IOrder> | FilterQuery<Partial<IOrder>>,
    select: Partial<Record<keyof IOrder, number | Boolean | object>>,
  ): Promise<Partial<IOrder> | null> {
    const order: Awaited<IOrder | null> = await Order.findOne(
      {
        ...orderPayload,
      },
      select,
    ).lean()

    return order
  }

  static async fetchOrderByParams(orderPayload: Partial<IOrder & IPagination>) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = orderPayload

    const order: Awaited<IOrder[] | null> = await Order.find({
      ...restOfPayload,
    })
      .populate({
        path: "scheduleId",
        populate: [
          "breakfast.dayOne",
          "breakfast.dayTwo",
          "breakfast.dayThree",
          "breakfast.dayFour",
          "breakfast.dayFive",
          "breakfast.daySix",
          "breakfast.daySeven",
          "lunch.dayOne",
          "lunch.dayTwo",
          "lunch.dayThree",
          "lunch.dayFour",
          "lunch.dayFive",
          "lunch.daySix",
          "lunch.daySeven",
          "dinner.dayOne",
          "dinner.dayTwo",
          "dinner.dayThree",
          "dinner.dayFour",
          "dinner.dayFive",
          "dinner.daySix",
          "dinner.daySeven",
        ],
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return order
  }

  static async updateOrderDetails(
    orderPayload: Partial<IOrder>,
    update: UpdateQuery<Partial<IOrder>>,
  ) {
    const updateOrder = await Order.findOneAndUpdate(
      {
        ...orderPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateOrder
  }
}
