import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { LogService } from "../services/logs.service";

export class LogController {

  static getAll = async (request: AuthRequest, response: Response) => {
    const logs = await LogService.getAll()
    response.send(logs)
  }

  static get = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const log = await LogService.get(id)
    if (!log) {
      response.status(404).send("Log not found")
      return
    }
    response.send(log)
  }

}
