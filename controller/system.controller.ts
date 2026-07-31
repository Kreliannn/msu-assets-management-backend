import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { TransferRequestService } from "../services/transferRequest.service";
import { AssetService } from "../services/asset.service";
import { LogService } from "../services/logs.service";
import { DisposalRecordService } from "../services/disposalRecord.service";
import { BorrowService } from "../services/borrow.service";
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

    await LogService.create({ type: "create", entity: "TransferRequest", entityId: "", performedBy: "system", description: `Transfer request for "${assetname}"`, date })
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
    const logDate = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "TransferRequest", entityId: id, performedBy: "system", description: `Approved transfer request for "${transferRequest.assetname}"`, date: logDate })
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
    const logDate = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "TransferRequest", entityId: id, performedBy: "system", description: `Rejected transfer request for "${transferRequest.assetname}"`, date: logDate })
    response.send(allRequests)
  }

  static getDisposalRecords = async (request: AuthRequest, response: Response) => {
    const records = await DisposalRecordService.getAll()
    response.send(records)
  }

  static createBorrowRecord = async (request: AuthRequest, response: Response) => {
    const { studentName, studentd, studentSection, assetId, assetName, assetQr } = request.body

    const now = new Date()
    const borrowDate = now.toISOString().split("T")[0]
    const borrowTime = now.toTimeString().split(" ")[0].slice(0, 5)

    await BorrowService.create({
      studentName,
      studentd,
      studentSection,
      borrowDate,
      borrowTime,
      returnDate: null,
      returnTime: null,
      assetId,
      assetName,
      assetQr,
      status: "borrowed",
    })

    await AssetService.borrow(assetId)

    const logDate = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "create", entity: "Borrow", entityId: "", performedBy: "system", description: `Asset "${assetName}" borrowed by ${studentName}`, date: logDate })
    response.send({ message: "Borrow record created successfully", status: "borrowed" })
  }

  static getBorrowRecords = async (request: AuthRequest, response: Response) => {
    const borrows = await BorrowService.getAll()
    response.send(borrows)
  }

  static returnBorrowRecord = async (request: AuthRequest, response: Response) => {
    const { id } = request.params

    const borrow = await BorrowService.get(id)
    if (!borrow) {
      response.status(404).send("Borrow record not found")
      return
    }

    const now = new Date()
    const returnDate = now.toISOString().split("T")[0]
    const returnTime = now.toTimeString().split(" ")[0].slice(0, 5)

    await BorrowService.update(id, {
      studentName: borrow.studentName,
      studentd: borrow.studentd,
      studentSection: borrow.studentSection,
      borrowDate: borrow.borrowDate,
      borrowTime: borrow.borrowTime,
      returnDate,
      returnTime,
      assetId: borrow.assetId,
      assetName: borrow.assetName,
      assetQr: borrow.assetQr,
      status: "returned",
    })

    await AssetService.returnBorrow(borrow.assetId)

    const logDate = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "Borrow", entityId: id, performedBy: "system", description: `Asset "${borrow.assetName}" returned by ${borrow.studentName}`, date: logDate })
    response.send({ message: "Borrow record returned successfully", status: "returned" })
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

    const logDate = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "create", entity: "DisposalRecord", entityId: "", performedBy: "system", description: `Disposed asset "${assetname}"`, date: logDate })
    response.send({ message: "Disposal record created successfully" })
  }

}
