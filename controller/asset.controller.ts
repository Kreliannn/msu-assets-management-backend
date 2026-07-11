import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { assetsInterfaceInput } from "../types/asset.type";
import { AssetService } from "../services/asset.service";

export class AssetController {

  static create = async (request: AuthRequest, response: Response) => {
    const assetData: assetsInterfaceInput = request.body
    await AssetService.create(assetData)
    const assets = await AssetService.getAll()
    response.send(assets)
  }

  static getAll = async (request: AuthRequest, response: Response) => {
    const assets = await AssetService.getAll()
    response.send(assets)
  }

  static get = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const asset = await AssetService.get(id)
    if (!asset) {
      response.status(404).send("Asset not found")
      return
    }
    response.send(asset)
  }

  static update = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const assetData: assetsInterfaceInput = request.body
    const asset = await AssetService.get(id)
    if (!asset) {
      response.status(404).send("Asset not found")
      return
    }
    await AssetService.update(id, assetData)
    const updated = await AssetService.get(id)
    response.send(updated)
  }

  static delete = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const asset = await AssetService.get(id)
    if (!asset) {
      response.status(404).send("Asset not found")
      return
    }
    await AssetService.delete(id)
    response.send({ message: "Asset deleted successfully" })
  }

}
