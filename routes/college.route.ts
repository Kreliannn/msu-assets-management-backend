import { Router } from "express";
import { CollegeController } from "../controller/college.controller";

const route = Router()

route.post("/", CollegeController.create)
route.get("/", CollegeController.getAll)
route.get("/:id", CollegeController.get)
route.put("/:id", CollegeController.update)
route.delete("/:id", CollegeController.delete)

export default route
