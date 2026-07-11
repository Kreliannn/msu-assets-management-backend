import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { collegeInterfaceInput } from "../types/college.type";
import { CollegeService } from "../services/college.service";

export class CollegeController {

  static create = async (request: AuthRequest, response: Response) => {
    const collegeData: collegeInterfaceInput = request.body
    await CollegeService.create(collegeData)
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
    await CollegeService.update(id, collegeData)
    const updated = await CollegeService.get(id)
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
    response.send({ message: "College deleted successfully" })
  }

}
