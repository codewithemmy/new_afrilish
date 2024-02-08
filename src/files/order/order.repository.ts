import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { IOrder } from "./order.interface"
import Order from "./order.model"
import { ICoord } from "../user/user.interface"
const { LIMIT, SKIP, SORT } = pagination

export default class OrderRepository {
  static async createOrder(orderPayload: Partial<IOrder>): Promise<IOrder> {
    return Order.create(orderPayload)
  }

  static async fetchAllOrders(
    orderPayload: Partial<IOrder> | FilterQuery<Partial<IOrder>>,
  ) {
    const order: Awaited<IOrder[] | null> = await Order.find({
      ...orderPayload,
    })

    return order
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
      .populate({ path: "itemId._id" })
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
        select:
          "-createdAt -updatedAt -_id -startDate -endDate -isDelete -__v -userId -status",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return order
  }

  static async fetchOrderLocations(
    orderPayload: Partial<IOrder & IPagination & ICoord>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = orderPayload

    let { lat, lng, search, ...extraParams } = restOfPayload
    if (!search) search = ""

    let latToString: any = lat?.toString()
    let lngToString: any = lng?.toString()

    let latString: string = latToString
    let lngString: string = lngToString

    const floatString = "10000"
    const order = await Order.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lngString), parseFloat(latString)],
          },
          key: "locationCoord",
          maxDistance: parseFloat(floatString),
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $lookup: {
          from: "vendor",
          localField: "vendorId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                locationCoord: 1,
                address: 1,
                phone: 1,
                image: 1,
              },
            },
          ],
          as: "vendorDetails",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "orderedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "item",
          localField: "itemId._id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                description: 1,
                price: 1,
                image: 1,
              },
            },
          ],
          as: "itemDetails",
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { "vendorDetails.name": { $regex: search, $options: "i" } },
              ],
              paymentStatus: "paid",
              ...extraParams,
            },
          ],
        },
      },
    ])
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return order
  }

  static async riderOrderWithoutLocations(
    orderPayload: Partial<IOrder & IPagination>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = orderPayload

    const order = await Order.aggregate([
      {
        $lookup: {
          from: "vendor",
          localField: "vendorId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                locationCoord: 1,
                address: 1,
                phone: 1,
                image: 1,
              },
            },
          ],
          as: "vendorDetails",
        },
      },
      {
        $lookup: {
          from: "User",
          localField: "orderedBy",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "item",
          localField: "itemId._id",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                description: 1,
                price: 1,
                image: 1,
              },
            },
          ],
          as: "itemDetails",
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $match: {
          paymentStatus: "paid",
          ...restOfPayload,
        },
      },
    ])
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return order
  }

  static async adminOrderAnalysis() {
    const currentDate = new Date()
    const thirtyDaysAgo = new Date(
      currentDate.getTime() - 30 * 24 * 60 * 60 * 1000,
    )

    const result = await Order.aggregate([
      {
        $match: {
          createAt: { $gte: thirtyDaysAgo }, // Filter orders within the last 30 days
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          totalAmount: { $sum: "$totalAmount" }, // Calculate the sum of totalAmount for each orderStatus
        },
      },
    ])
    // Now, calculate the increase percentage compared to the previous 30 days for each orderStatus
    const previousThirtyDays = new Date(
      thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000,
    )

    const response = []
    for (const statusGroup of result) {
      const orderStatus = statusGroup._id
      const totalAmountLastThirtyDays = statusGroup.totalAmount

      const previousResult = await Order.aggregate([
        {
          $match: {
            orderStatus,
            orderDate: { $gte: previousThirtyDays, $lt: thirtyDaysAgo }, // Filter orders of the previous 30 days for this orderStatus
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" }, // Calculate the sum of totalAmount for this orderStatus
          },
        },
      ])

      const totalAmountPreviousThirtyDays =
        previousResult.length > 0 ? previousResult[0].totalAmount : 0

      // Calculate percentage increase
      const percentageIncrease =
        ((totalAmountLastThirtyDays - totalAmountPreviousThirtyDays) /
          totalAmountPreviousThirtyDays) *
        100

      // Add the result to the response array
      response.push({
        [`total${
          orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)
        }OrderAmount`]: totalAmountLastThirtyDays,
        percentageIncrease,
      })
    }

    return response
  }
}
