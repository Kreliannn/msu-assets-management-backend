import { Router } from "express";
import { AssetController } from "../controller/asset.controller";
import { upload } from "../utils/upload";

const route = Router()

route.post("/", AssetController.create)
route.get("/", AssetController.getAll)
route.post("/import-excel", upload.single("file"), AssetController.importFromExcel)
route.put("/bulk-transfer", AssetController.bulkTransfer)
route.get("/:id", AssetController.get)
route.put("/:id", AssetController.update)
route.put("/:id/assign", AssetController.assign)
route.put("/:id/repair-toggle", AssetController.toggleRepair)
route.delete("/:id", AssetController.delete)

export default route
