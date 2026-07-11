import { Router } from "express";
import accountRoute from "./account.route"
import assetRoute from "./asset.route"
import collegeRoute from "./college.route"

const routes = Router()

routes.use("/account", accountRoute)
routes.use("/asset", assetRoute)
routes.use("/college", collegeRoute)

export default routes