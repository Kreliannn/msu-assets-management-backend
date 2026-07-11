import { Router } from "express";
import { AssetController } from "../controller/asset.controller";

const route = Router()

route.post("/", AssetController.create)
route.get("/", AssetController.getAll)
route.get("/:id", AssetController.get)
route.put("/:id", AssetController.update)
route.delete("/:id", AssetController.delete)

export default route
