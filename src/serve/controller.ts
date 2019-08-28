
import { Schema, Types } from 'mongoose';
import { HttpStatusCode } from 'config'
import Joi from '@hapi/joi';
import Transaction from 'mongoose-transactions-typescript';
import moment from 'moment';

import { ErrorWithCode } from 'lib/errorHandler'
import { generateToken } from 'lib/token'
import { TokenTypes } from 'typings/type'

export class Controller {
    readonly httpStatusCode:HttpStatusCode = new HttpStatusCode();
    readonly adminId:Schema.Types.ObjectId = <any>process.env.ADMIN_ID;
    readonly ObjectId:Types.ObjectIdConstructor = Types.ObjectId;
    readonly ErrorWithCode = ErrorWithCode;
    readonly Transaction = Transaction;
    readonly generateToken = generateToken;
    readonly Joi = Joi;
    readonly moment = moment;

    public validateObjectId(id:string, msg?:string){
        if(!this.ObjectId.isValid(id)){
            throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, msg || '올바른 값을 입력하세요');
        }
    }

    public validateParams(params:{}, regex:{}, msg?:string){
        const validation = this.Joi.validate(params, Joi.object().keys(regex));
        if(validation.error) {
            console.error('validation.error : ', validation.error);
            throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, msg || '잘못된 요청입니다');
        }
    }

    public authenticateLoggedUser(user:TokenTypes.TokenPayload|null, msg?:string){
        if(!user){
            throw new this.ErrorWithCode(this.httpStatusCode.NOT_ACCEPTABLE, msg || '로그인이 필요합니다');
        }
    }

    public authenticateAccessableID(userId:Schema.Types.ObjectId, id?:Schema.Types.ObjectId|Schema.Types.ObjectId[], msg?:string){
        if(Array.isArray(id)){
            if(!id.includes(userId)){
                throw new this.ErrorWithCode(this.httpStatusCode.NOT_ACCEPTABLE, msg || '권한이 없습니다');
            }
        } else if(!id || userId !== id){
            throw new this.ErrorWithCode(this.httpStatusCode.NOT_ACCEPTABLE, msg || '권한이 없습니다');
        }
    }

}

export default Controller;

