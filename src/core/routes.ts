import { Application } from "express"
import PartnerRouter from "../files/partner/partner.route"
import MenuRouter from "../files/menu/menu.route"
import ItemRouter from "../files/item/item.route"
import UserRouter from "../files/user/user.route"

export const routes = (app: Application) => {
  const base = "/api/v1"

  app.use(`${base}/partner`, PartnerRouter)
  app.use(`${base}/menu`, MenuRouter)
  app.use(`${base}/item`, ItemRouter)
  app.use(`${base}/user`, UserRouter)
}
