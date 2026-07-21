import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { TransferRequestService } from "../services/transferRequest.service";
import { AssetService } from "../services/asset.service";
import { DisposalRecordService } from "../services/disposalRecord.service";
import cloudinary from "../utils/cloudinary";
import fs from "fs";

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
        date : asset.date,
        value : asset.value,
        assignTo : asset.assignTo!
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

  static getDisposalRecords = async (request: AuthRequest, response: Response) => {
    const records = await DisposalRecordService.getAll()
    response.send(records)
  }

  static createDisposalRecord = async (request: AuthRequest, response: Response) => {
    const { assetname, message, date, college, recordedBy, assetId } = request.body

    let proofUrl = ""

    // Upload image to cloudinary if a file was uploaded
    if (request.file) {
      const result = await cloudinary.uploader.upload(request.file.path, {
        folder: "disposal-proofs",
      })
      proofUrl = result.secure_url

      // Clean up local file after upload
      fs.unlink(request.file.path, () => {})
    }

    

    await DisposalRecordService.create({
      assetname,
      message,
      date,
      college,
      recordedBy,
      proof: proofUrl,
    })

    await AssetService.dispose(assetId)

    response.send({ message: "Disposal record created successfully" })
  }

}
