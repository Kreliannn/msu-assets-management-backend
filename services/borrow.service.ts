import BorrowModel from "../model/borrow.model"
import { borrowInterfaceInput } from "../types/borrow.type";

export class BorrowService {

  static async create(data: borrowInterfaceInput) {
    await BorrowModel.create(data)
  }

  static async getAll() {
    const borrows = BorrowModel.find().sort({ _id: -1 });
    return borrows
  }

  static async get(id: string) {
    const borrow = BorrowModel.findById(id);
    return borrow
  }

  static async delete(id: string) {
    const borrow = BorrowModel.findByIdAndDelete(id);
    return borrow
  }

  static async update(id: string, data: borrowInterfaceInput) {
    await BorrowModel.findByIdAndUpdate(id, data);
  }

}
