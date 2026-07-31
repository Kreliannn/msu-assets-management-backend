import AssetModel from "../model/asset.model"
import { assetsInterfaceInput } from "../types/asset.type";

export class AssetService {

  static async create(data: assetsInterfaceInput) {
    await AssetModel.create(data)
  }

  static async getAll() {
    const assets = AssetModel.find().sort({ _id: -1 });
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

  static async dispose(id: string) {
    await AssetModel.findByIdAndUpdate(id, {status : "disposed", condition : "unserviceable" });
  }

  static async borrow(id: string) {
    await AssetModel.findByIdAndUpdate(id, { status: "borrowed" });
  }

  static async returnBorrow(id: string) {
    await AssetModel.findByIdAndUpdate(id, { status: "in use" });
  }

  static async assign(id: string, assignTo: string | null) {
    await AssetModel.findByIdAndUpdate(id, { assignTo });
  }

  static async bulkTransfer(ids: string[], location: string | null, custodian: string | null) {
    await AssetModel.updateMany(
      { _id: { $in: ids } },
      { $set: { location, custodian, status: "in use" } }
    );
  }

  static async toggleRepair(id: string) {
    const asset = await AssetModel.findById(id);
    if (!asset) return null;

    if (asset.status === "underRepair") {
      // Turning off repair mode - restore based on location
      const newStatus = asset.location ? "in use" : "available";
      await AssetModel.findByIdAndUpdate(id, { status: newStatus });
    } else {
      // Turning on repair mode
      await AssetModel.findByIdAndUpdate(id, { status: "underRepair" });
    }

    return AssetModel.findById(id);
  }

}
