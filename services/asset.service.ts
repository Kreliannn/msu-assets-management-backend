import AssetModel from "../model/asset.model"
import { assetsInterfaceInput } from "../types/asset.type";

export class AssetService {

  static async create(data: assetsInterfaceInput) {
    await AssetModel.create(data)
  }

  static async getAll() {
    const assets = AssetModel.find();
    return assets
  }

  static async get(id: string) {
    const asset = AssetModel.findById(id);
    return asset
  }

  static async delete(id: string) {
    const asset = AssetModel.findByIdAndDelete(id);
    return asset
  }

  static async update(id: string, data: assetsInterfaceInput) {
    await AssetModel.findByIdAndUpdate(id, data);
  }

}
