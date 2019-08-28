import { httpStatusCode } from 'config'
import { Context } from 'koa'

export class ErrorWithCode extends Error {
    code?:number;
    constructor(code:number, message?:string){
        super(message);
        if(code) this.code = code;
    }
}

export class ErrorHandler {
    log(error:ErrorWithCode, ctx:Context){
        if(error.code){
            console.error('error.code : ', error.code, " -> ", error.message || httpStatusCode.getDefaultText(error.code))
            // ctx.throw(error.code, error.message || httpStatusCode.getDefaultText(error.code) )
            ctx.status = error.code;
            ctx.body = error.message || httpStatusCode.getDefaultText(error.code);
        } else {
            console.error('ctx.status : ', ctx.status, " -> ", error.message);
            // ctx.throw(500, httpStatusCode.getDefaultText(500))
            ctx.status = 500;
            ctx.body = httpStatusCode.getDefaultText(500);
        }
    }
}
