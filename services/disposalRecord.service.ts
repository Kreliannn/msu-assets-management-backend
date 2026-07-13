import DisposalRecordModel from "../model/disposalRecord.model"
import { disposalRecordInterfaceInput } from "../types/disposalRecord.type";

export class DisposalRecordService {

  static async create(data: disposalRecordInterfaceInput) {
    await DisposalRecordModel.create(data)
  }

  static async getAll() {
    const records = DisposalRecordModel.find().sort({ _id: -1 });
    return records
  }

  static async get(id: string) {
    const record = DisposalRecordModel.findById(id);
    return record
  }

  static async delete(id: string) {
    const record = DisposalRecordModel.findByIdAndDelete(id);
    return record
  }

  static async update(id: string, data: disposalRecordInterfaceInput) {
    await DisposalRecordModel.findByIdAndUpdate(id, data);
  }

}
