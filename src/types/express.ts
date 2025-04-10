import { Request as ExpressRequest, Response as ExpressResponse } from "express"

export interface Request extends ExpressRequest {}

export interface Response extends ExpressResponse {}
