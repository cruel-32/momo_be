import { Document, Model, Schema } from 'mongoose';

declare namespace AccountTypes {
    export interface IAccountDocument extends Document {
        email: string;
        username: string;
        _key_: string;
        _salt_:string;
    
        authentication:string;
        birth?:Date;
        thumbnail:string;
        name?:string;
        phone?:number;
        createdAt:Date;
        deleted:string;
        owns:Schema.Types.ObjectId[];
        managements:Schema.Types.ObjectId[];
        togethers:Schema.Types.ObjectId[];
        message:string;
        social:{
            naver:snsPayload;
            facebook:snsPayload;
            google:snsPayload;
            kakao:snsPayload;
        };
    
        validatePassword(params:hashPayload):Promise<any>;
    }
    
    export interface IAccount extends IAccountDocument {
        hidePersonalOne():IAccountModel;
    }
    
    export interface IAccountModel extends Model<IAccount> {
        createAccount(object:{}):IAccountDocument;
        findByEmail(object:{}):IAccountDocument;
        findByEmailOrPhone(object:{}):IAccountDocument;
    }
    
    export type createPayload = {
        username : IAccountDocument["username"];
        email : IAccountDocument["email"];
        password : string;
    }
    
    export type hashPayload = {
        __salt__ : string;
        __key__ : string;
        password : string;
    }

    export type snsPayload = {
        id:string;
        accessToken:string;
    }
}
