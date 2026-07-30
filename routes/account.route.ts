import { Router } from "express";
import { AccountController } from "../controller/accounts.controller";
import { upload } from "../utils/upload";

const route = Router()

route.post("/", upload.single("profile"), AccountController.createAccount)
route.get("/", AccountController.getAll)
route.post("/login", AccountController.login)
route.get("/:id", AccountController.get)
route.put("/:id", upload.single("profile"), AccountController.update)
route.delete("/:id", AccountController.delete)


export default route