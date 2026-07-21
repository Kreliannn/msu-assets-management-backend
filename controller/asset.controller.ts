import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { assetsInterfaceInput } from "../types/asset.type";
import { AssetService } from "../services/asset.service";
import { generateQrCode } from "../utils/customFunction";
import ExcelJS from "exceljs";
import fs from "fs";

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
    response.send(updated)
  }

  static bulkTransfer = async (request: AuthRequest, response: Response) => {
    const { ids, location, custodian } = request.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      response.status(400).send("No asset IDs provided")
      return
    }

    await AssetService.bulkTransfer(ids, location ?? null, custodian ?? null)
    const updated = await AssetService.getAll()
    response.send(updated)
  }

  static toggleRepair = async (request: AuthRequest, response: Response) => {
    const { id } = request.params

    const updated = await AssetService.toggleRepair(id)
    if (!updated) {
      response.status(404).send("Asset not found")
      return
    }

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
