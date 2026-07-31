import CollegeModel from "../model/college.model"
import { collegeInterfaceInput } from "../types/college.type";

export class CollegeService {

  static async create(data: collegeInterfaceInput) {
    await CollegeModel.create(data)
  }

  static async getAll() {
    const colleges = CollegeModel.find().sort({ _id: -1 });
    return colleges
  }

  static async get(id: string) {
    const college = CollegeModel.findById(id);
    return college
  }

  static async getByDepartment(department: string) {
    const college = await CollegeModel.findOne({ department });
    return college
  }

  static async delete(id: string) {
    const college = CollegeModel.findByIdAndDelete(id);
    return college
  }

  static async update(id: string, data: collegeInterfaceInput) {
    await CollegeModel.findByIdAndUpdate(id, data);
  }

}
