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
    const { schedule } = restOfPayload

    if (schedule) {
      const order: Awaited<IOrder[] | null> = await Order.find({
        ...restOfPayload,
      })
        .populate({ path: "itemId._id" })
        .populate({
          path: "scheduleId",
          populate: [
            "monday.breakfast.item",
            "monday.lunch.item",
            "monday.dinner.item",
            "tuesday.breakfast.item",
            "tuesday.lunch.item",
            "tuesday.dinner.item",
            "wednesday.breakfast.item",
            "wednesday.lunch.item",
            "wednesday.dinner.item",
            "thursday.breakfast.item",
            "thursday.lunch.item",
            "thursday.dinner.item",
            "friday.breakfast.item",
            "friday.dinner.item",
            "saturday.breakfast.item",
            "saturday.lunch.item",
            "saturday.dinner.item",
            "sunday.breakfast.item",
            "sunday.lunch.item",
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
    const order: Awaited<IOrder[] | null> = await Order.find({
      ...restOfPayload,
    })
      .populate({ path: "itemId._id" })
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
  // }
}
