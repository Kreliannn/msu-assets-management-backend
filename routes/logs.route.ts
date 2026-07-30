import { Router } from "express";
import { LogController } from "../controller/logs.controller";

const route = Router()

route.get("/", LogController.getAll)
route.get("/:id", LogController.get)

export default route
