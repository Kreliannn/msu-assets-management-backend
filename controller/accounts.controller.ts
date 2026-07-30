import { Response } from "express";
import { AuthRequest } from "../types/request.type";
import { accountInterface, accountInterfaceInput } from "../types/accounts.type";
import { AccountService } from "../services/acccount.service";
import { LogService } from "../services/logs.service";

export class AccountController {

  static createAccount = async (request: AuthRequest, response: Response) => {
    const accountData: accountInterfaceInput = request.body
    if (request.file) {
      accountData.profile = "/uploads/" + request.file.filename
    }
    accountData.dateCreated = new Date().toISOString().split("T")[0]
    accountData.status = accountData.status || "active"
    accountData.college = "none"
    await AccountService.create(accountData)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "create", entity: "Account", entityId: "", performedBy: "system", description: `Created account "${accountData.name}"`, date })
    const accounts = await AccountService.getAll()
    response.send(accounts)
  }

  static getAll = async (request: AuthRequest, response: Response) => {
    const accounts = await AccountService.getAll()
    response.send(accounts)
  }

  static get = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const account = await AccountService.get(id)
    if (!account) {
      response.status(404).send("Account not found")
      return
    }
    response.send(account)
  }

  static update = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const accountData: Partial<accountInterfaceInput> = request.body
    if (request.file) {
      accountData.profile = "/uploads/" + request.file.filename
    }
    const existing = await AccountService.get(id)
    if (!existing) {
      response.status(404).send("Account not found")
      return
    }
    const prevName = existing.name
    await AccountService.update(id, accountData)
    const updated = await AccountService.get(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "update", entity: "Account", entityId: id, performedBy: "system", description: `Updated account "${prevName}"`, date })
    response.send(updated)
  }

  static delete = async (request: AuthRequest, response: Response) => {
    const { id } = request.params
    const account = await AccountService.get(id)
    if (!account) {
      response.status(404).send("Account not found")
      return
    }
    const name = account.name
    await AccountService.delete(id)
    const date = new Date().toISOString().split("T")[0]
    await LogService.create({ type: "delete", entity: "Account", entityId: id, performedBy: "system", description: `Deleted account "${name}"`, date })
    response.send({ message: "Account deleted successfully" })
  }

  static login = async (request: AuthRequest, response: Response) => {
    const { username, password } = request.body
    const account = await AccountService.findByLogin(username, password)
    if (!account) {
      response.status(500).send("user not found")
      return
    }
    response.send(account)
  }

}
