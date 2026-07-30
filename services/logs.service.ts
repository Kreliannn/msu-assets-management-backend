import LogModel from "../model/logs.model"
import { logsInterfaceInput } from "../types/logs.type";

export class LogService {

  static async create(data: logsInterfaceInput) {
    await LogModel.create(data)
  }

  static async getAll() {
    const logs = LogModel.find().sort({ _id: -1 });
    return logs
  }

  static async get(id: string) {
    const log = LogModel.findById(id);
    return log
  }

  static async delete(id: string) {
    const log = LogModel.findByIdAndDelete(id);
    return log
  }

}
