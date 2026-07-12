import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { TransferRequestService } from "../services/transferRequest.service";
import { AssetService } from "../services/asset.service";

export class SystemController {

  static transferRequest = async (request: AuthRequest, response: Response) => {
    const { assetId, custodian, college, assetname } = request.body

    const date = new Date().toISOString().split("T")[0]

    await TransferRequestService.create({
      assetId,
      date,
      assetname,
      college: college || null,
      custodian: custodian || null,
      status: "pending",
    })

    response.send({ message: "Transfer request submitted successfully", status: "pending" })
  }

  static getTransferRequests = async (request: AuthRequest, response: Response) => {
    const transferRequests = await TransferRequestService.getAll()
    response.send(transferRequests)
  }

  static approveTransferRequest = async (request: AuthRequest, response: Response) => {
    const { id } = request.params

    const transferRequest = await TransferRequestService.get(id)
    if (!transferRequest) {
      response.status(404).send("Transfer request not found")
      return
    }

    // Update transfer request status to approved
    await TransferRequestService.update(id, {
      assetId: transferRequest.assetId,
      date: transferRequest.date,
      assetname: transferRequest.assetname,
      college: transferRequest.college ?? null,
      custodian: transferRequest.custodian ?? null,
      status: "approved",
    })

    // Update the asset's status to "in use", location, and custodian
    const asset = await AssetService.get(transferRequest.assetId)
    if (asset) {
      await AssetService.update(transferRequest.assetId, {
        name: asset.name,
        qr: asset.qr,
        category: asset.category,
        location: transferRequest.college ?? null,
        condition: asset.condition,
        status: "in use",
        custodian: transferRequest.custodian ?? null,
      })
    }

    const allRequests = await TransferRequestService.getAll()
    response.send(allRequests)
  }

  static rejectTransferRequest = async (request: AuthRequest, response: Response) => {
    const { id } = request.params

    const transferRequest = await TransferRequestService.get(id)
    if (!transferRequest) {
      response.status(404).send("Transfer request not found")
      return
    }

    await TransferRequestService.update(id, {
      assetId: transferRequest.assetId,
      date: transferRequest.date,
      assetname: transferRequest.assetname,
      college: transferRequest.college ?? null,
      custodian: transferRequest.custodian ?? null,
      status: "rejected",
    })

    const allRequests = await TransferRequestService.getAll()
    response.send(allRequests)
  }

}
