import { Router } from "express";
import { SystemController } from "../controller/system.controller";
import { upload } from "../utils/upload";

const route = Router()

route.post("/transfer-request", SystemController.transferRequest)
route.get("/transfer-requests", SystemController.getTransferRequests)
route.put("/transfer-request/approve/:id", SystemController.approveTransferRequest)
route.put("/transfer-request/reject/:id", SystemController.rejectTransferRequest)

route.get("/disposal-records", SystemController.getDisposalRecords)
route.post("/disposal-record", upload.single("proof"), SystemController.createDisposalRecord)

export default route
