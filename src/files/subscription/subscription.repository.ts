import { FilterQuery, UpdateQuery } from "mongoose"
import pagination, { IPagination } from "../../constants"
import { ISubscription } from "./subscription.interface"
import Subscription from "./subscription.model"

const { LIMIT, SKIP, SORT } = pagination

export default class SubRepository {
  static async createSubscription(
    subscriptionPayload: Partial<ISubscription>,
  ): Promise<ISubscription> {
    return Subscription.create(subscriptionPayload)
  }

  static async fetchSubscription(
    subscriptionPayload:
      | Partial<ISubscription>
      | FilterQuery<Partial<ISubscription>>,
    select: Partial<Record<keyof ISubscription, number | Boolean | object>>,
  ): Promise<Partial<ISubscription> | null> {
    const subscription: Awaited<ISubscription | null> = await Subscription.findOne(
      {
        ...subscriptionPayload,
      },
      select,
    ).lean()

    return subscription
  }

  static async fetchSubscriptionByParams(
    subscriptionPayload: Partial<ISubscription & IPagination>,
  ) {
    const {
      limit = LIMIT,
      skip = SKIP,
      sort = SORT,
      ...restOfPayload
    } = subscriptionPayload

    const subscription: Awaited<ISubscription[] | null> =
      await Subscription.find({
        ...restOfPayload,
      })
        .populate({
          path: "userId",
          select: "fullName phone email home office",
        })
        .populate([
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
        ])
        .sort(sort)
        .skip(skip)
        .limit(limit)

    return subscription
  }

  static async updateSubscriptionDetails(
    subscriptionPayload: Partial<ISubscription>,
    update: UpdateQuery<Partial<ISubscription>>,
  ) {
    const updateSubscription = await Subscription.findOneAndUpdate(
      {
        ...subscriptionPayload,
      },
      { ...update },
      { new: true, runValidators: true }, //returns details about the update
    )

    return updateSubscription
  }
}
