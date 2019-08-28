import { Schema } from 'mongoose';

declare namespace TokenTypes {
    export type TokenPayload = {
        _id:Schema.Types.ObjectId;
        thumbnail:string;
        username:string;
        message:string;
    }
    
    export type TokenCookie = TokenPayload & {
        iat: number;
        exp: number; 
    }
}
