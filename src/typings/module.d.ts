import * as koa from "koa"
import { TokenTypes } from 'typings/type'

declare module 'koa'{
    interface Request {
        user : TokenTypes.TokenCookie|null;
    }
}

declare module 'mongoose' {
    interface QueryFindOneAndUpdateOptions {
        arrayFilters?:{[key:string]:any}[];
    }
}