import TransferRequestModel from "../model/transferRequest.model"
import { transferRequestInterfaceInput } from "../types/transferRequest.type";

export class TransferRequestService {

  static async create(data: transferRequestInterfaceInput) {
    await TransferRequestModel.create(data)
  }

  static async getAll() {
    const transferRequests = TransferRequestModel.find().sort({ _id: -1 });
    return transferRequests
  }

  static async get(id: string) {
    const transferRequest = TransferRequestModel.findById(id);
    return transferRequest
  }

  static async delete(id: string) {
    const transferRequest = TransferRequestModel.findByIdAndDelete(id);
    return transferRequest
  }

  static async update(id: string, data: transferRequestInterfaceInput) {
    await TransferRequestModel.findByIdAndUpdate(id, data);
  }

}
