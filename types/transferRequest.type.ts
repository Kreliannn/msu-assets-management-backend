


export interface transferRequestInterfaceInput {
    assetId : string,
    assetname : string,
    date : string,
    college : string | null,
    custodian : string | null,
    status : "pending" | "approved" | "rejected",
}

export interface transferRequestInterface extends transferRequestInterfaceInput {
    _id : string,
}

