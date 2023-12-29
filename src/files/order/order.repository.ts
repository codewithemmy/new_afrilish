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
      .populate("itemId._id")
      .populate({
        path: "scheduleId",
        populate: [
          "monday.breakfast.item",
          "monday.launch.item",
          "monday.dinner.item",
          "tuesday.breakfast.item",
          "tuesday.launch.item",
          "tuesday.dinner.item",
          "wednesday.breakfast.item",
          "wednesday.launch.item",
          "wednesday.dinner.item",
          "thursday.breakfast.item",
          "thursday.launch.item",
          "thursday.dinner.item",
          "friday.breakfast.item",
          "friday.dinner.item",
          "saturday.breakfast.item",
          "saturday.launch.item",
          "saturday.dinner.item",
          "sunday.breakfast.item",
          "sunday.launch.item",
          "sunday.dinner.item",
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
      { new: true, runValidators: true },
    )

    return updateOrder
  }
}
