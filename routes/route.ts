import { Router } from "express";
import accountRoute from "./account.route"
import assetRoute from "./asset.route"
import collegeRoute from "./college.route"
import systemRoute from "./system.route"
import logsRoute from "./logs.route"

const routes = Router()

routes.use("/account", accountRoute)
routes.use("/asset", assetRoute)
routes.use("/college", collegeRoute)
routes.use("/system", systemRoute)
routes.use("/logs", logsRoute)

export default routes