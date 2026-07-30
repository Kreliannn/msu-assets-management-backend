import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { collegeInterfaceInput } from "../types/college.type";
import { CollegeService } from "../services/college.service";
import { LogService } from "../services/logs.service";

export class CollegeController {

  static create = async (request: AuthRequest, response: Response) => {
    const collegeData: collegeInterfaceInput = request.body
    await CollegeService.create(collegeData)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "create", entity: "College", entityId: "", performedBy: "system", description: `Created college "${collegeData.department}"`, date })
    const colleges = await CollegeService.getAll()
    response.send(colleges)
  }

  static getAll = async (request: AuthRequest, response: Response) => {
    const colleges = await CollegeService.getAll()
    response.send(colleges)
  }

  static get = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const college = await CollegeService.get(id)
    if (!college) {
      response.status(404).send("College not found")
      return
    }
    response.send(college)
  }

  static update = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const collegeData: collegeInterfaceInput = request.body
    const college = await CollegeService.get(id)
    if (!college) {
      response.status(404).send("College not found")
      return
    }
    const prevDept = college.department
    await CollegeService.update(id, collegeData)
    const updated = await CollegeService.get(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "College", entityId: id, performedBy: "system", description: `Updated college "${prevDept}"`, date })
    response.send(updated)
  }

  static delete = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const college = await CollegeService.get(id)
    if (!college) {
      response.status(404).send("College not found")
      return
    }
    await CollegeService.delete(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "delete", entity: "College", entityId: id, performedBy: "system", description: `Deleted college "${college.department}"`, date })
    response.send({ message: "College deleted successfully" })
  }

}
