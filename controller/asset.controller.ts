import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { assetsInterfaceInput } from "../types/asset.type";
import { AssetService } from "../services/asset.service";
import { LogService } from "../services/logs.service";
import { generateQrCode } from "../utils/customFunction";
import ExcelJS from "exceljs";
import fs from "fs";
import { TransferRequestService } from "../services/transferRequest.service";

export class AssetController {

  static create = async (request: AuthRequest, response: Response) => {

    const assetData: assetsInterfaceInput = request.body.assets
    const qty: number = request.body.qty
    for (let i = 0; i < qty; i++) {
      const asset = assetData
      asset.qr = generateQrCode()
      await AssetService.create(asset)
    }
    const assets = await AssetService.getAll()
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "create", entity: "Asset", entityId: "", performedBy: "system", description: `Created ${qty} asset(s) "${assetData.name}"`, date })
    response.send(assets)
  }


  static transfer = async (request: AuthRequest, response: Response) => {
      const { assetId, custodian, college, assetname } = request.body
      
      const asset = await AssetService.get(assetId)
      if (asset) {
        await AssetService.update(assetId, {
          name: asset.name,
          qr: asset.qr,
          category: asset.category,
          location: college ?? null,
          condition: asset.condition,
          status: "in use",
          custodian: custodian ?? null,
          date : asset.date,
          value : asset.value,
          assignTo : asset.assignTo!
        })
      }
  
      const date = new Date().toISOString().split("T")[0]
      await LogService.create({ type: "update", entity: "Asset", entityId: assetId, performedBy: "system", description: `Transferred asset "${assetname}" to ${college || "unknown"} / ${custodian || "unknown"}`, date })
  
      response.send({ message: "Transfer request submitted successfully", status: "pending" })
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
    const prevName = asset.name
    await AssetService.update(id, assetData)
    const updated = await AssetService.get(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "Asset", entityId: id, performedBy: "system", description: `Updated asset "${prevName}"`, date })
    response.send(updated)
  }

  static delete = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const asset = await AssetService.get(id)
    if (!asset) {
      response.status(404).send("Asset not found")
      return
    }
    const name = asset.name
    await AssetService.delete(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "delete", entity: "Asset", entityId: id, performedBy: "system", description: `Deleted asset "${name}"`, date })
    response.send({ message: "Asset deleted successfully" })
  }

  static assign = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const { assignTo } = request.body

    const asset = await AssetService.get(id)
    if (!asset) {
      response.status(404).send("Asset not found")
      return
    }

    await AssetService.assign(id, assignTo ?? null)
    const updated = await AssetService.get(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "Asset", entityId: id, performedBy: "system", description: `Assigned asset "${asset?.name}" to ${assignTo || "unassigned"}`, date })
    response.send(updated)
  }

  static bulkTransfer = async (request: AuthRequest, response: Response) => {
    const { ids, location, custodian } = request.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      response.status(400).send("No asset IDs provided")
      return
    }

    await AssetService.bulkTransfer(ids, location, custodian)
    
    const updated = await AssetService.getAll()
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "Asset", entityId: "", performedBy: "system", description: `Bulk transferred ${ids.length} asset(s)`, date })
    response.send(updated)
  }

  static toggleRepair = async (request: AuthRequest, response: Response) => {
    const { id } = request.params

    const updated = await AssetService.toggleRepair(id)
    if (!updated) {
      response.status(404).send("Asset not found")
      return
    }

    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "Asset", entityId: id, performedBy: "system", description: `Toggled repair status for asset "${updated.name}"`, date })
    response.send(updated)
  }

  static importFromExcel = async (request: AuthRequest, response: Response) => {
    if (!request.file) {
      response.status(400).send("No file uploaded")
      return
    }

    try {
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.readFile(request.file.path)
      const worksheet = workbook.worksheets[0]

      if (!worksheet) {
        response.status(400).send("Excel file has no worksheets")
        return
      }

      // Find the header row by looking for "Property Name"
      let headerRowNumber = 0
      worksheet.eachRow((row, rowNumber) => {
        const firstCell = row.getCell(1).value
        if (
          firstCell &&
          String(firstCell).toLowerCase() === "property name"
        ) {
          headerRowNumber = rowNumber
        }
      })

      if (!headerRowNumber) {
        response.status(400).send("Could not find the table header row. Make sure the Excel file follows the template format.")
        return
      }

      const createdAssets: assetsInterfaceInput[] = []
      const errors: { row: number; message: string }[] = []

      // Read rows below the header
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= headerRowNumber) return

        const name = row.getCell(1).value
        const date = row.getCell(2).value
        const value = row.getCell(3).value
        const category = row.getCell(4).value
        const condition = row.getCell(5).value

        // Skip completely empty rows
        if (!name || !String(name).trim()) return

        const nameStr = String(name).trim()

        if (!nameStr) {
          errors.push({ row: rowNumber, message: "Property name is empty" })
          return
        }

        if (!category || !String(category).trim()) {
          errors.push({ row: rowNumber, message: "Category is missing" })
          return
        }

        const validCategories = ["property", "plant", "equipment"]
        const catStr = String(category).trim().toLowerCase()
        if (!validCategories.includes(catStr)) {
          errors.push({ row: rowNumber, message: `Invalid category "${catStr}". Must be property, plant, or equipment.` })
          return
        }

        if (!condition || !String(condition).trim()) {
          errors.push({ row: rowNumber, message: "Condition is missing" })
          return
        }

        const validConditions = ["good", "serviceable", "unserviceable"]
        const condStr = String(condition).trim().toLowerCase()
        if (!validConditions.includes(condStr)) {
          errors.push({ row: rowNumber, message: `Invalid condition "${condStr}". Must be good, serviceable, or unserviceable.` })
          return
        }

        // Parse value - handle currency format like "₱1,000.00"
        let valueNum: number
        if (typeof value === "number") {
          valueNum = value
        } else {
          const cleaned = String(value).replace(/[₱$,]/g, "").trim()
          valueNum = parseFloat(cleaned)
        }

        if (isNaN(valueNum) || valueNum < 0) {
          errors.push({ row: rowNumber, message: "Invalid or missing value" })
          return
        }

        // Parse date
        let dateStr: string
        if (date instanceof Date) {
          dateStr = date.toISOString().split("T")[0]
        } else if (typeof date === "number") {
          // Excel serial date number
          const excelEpoch = new Date(1899, 11, 30)
          const parsed = new Date(excelEpoch.getTime() + date * 86400000)
          dateStr = parsed.toISOString().split("T")[0]
        } else {
          dateStr = String(date).trim()
        }

        createdAssets.push({
          name: nameStr.charAt(0).toUpperCase() + nameStr.slice(1),
          qr: generateQrCode(),
          date: dateStr,
          value: valueNum,
          category: catStr,
          condition: condStr,
          status: "available",
          location: null,
          custodian: null,
          assignTo: null,
        })
      })

      if (createdAssets.length === 0) {
        response.status(400).json({
          message: "No valid asset entries found in the Excel file.",
          errors,
        })
        return
      }

      // Create all assets
      for (const asset of createdAssets) {
        await AssetService.create(asset)
      }

      const allAssets = await AssetService.getAll()

      // Clean up the uploaded file
      try {
        fs.unlinkSync(request.file.path)
      } catch {
        // Ignore cleanup errors
      }

      const logDate = new Date().toISOString().split("T")[0]
      await LogService.create({ type: "create", entity: "Asset", entityId: "", performedBy: "system", description: `Imported ${createdAssets.length} asset(s) from Excel`, date: logDate })
      response.json({
        created: createdAssets.length,
        errors: errors.length > 0 ? errors : undefined,
        assets: allAssets,
      })
    } catch (err) {
      console.error("Excel import error:", err)
      response.status(500).send("Failed to process the Excel file. Make sure it follows the template format.")
    }
  }

}
