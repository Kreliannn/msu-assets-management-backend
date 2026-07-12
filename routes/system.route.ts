import { Router } from "express";
import { SystemController } from "../controller/system.controller";

const route = Router()

route.post("/transfer-request", SystemController.transferRequest)
route.get("/transfer-requests", SystemController.getTransferRequests)
route.put("/transfer-request/approve/:id", SystemController.approveTransferRequest)
route.put("/transfer-request/reject/:id", SystemController.rejectTransferRequest)

export default route
