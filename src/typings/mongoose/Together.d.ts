import { Document, Model, Schema } from 'mongoose';

declare namespace TogetherTypes {
    export interface ITogetherDocument extends Document {
        title: string;
        image: string;
        categoryId:Schema.Types.ObjectId;
        locationId:Schema.Types.ObjectId;
        ownerId:Schema.Types.ObjectId;
        managerIds:Schema.Types.ObjectId[];
        bannedIds:Schema.Types.ObjectId[];
        subscribe:string;
        message:string;
        limit:number;
        maxAge:Date;
        minAge:Date;
        eventcategories:eventPayload[];
        members:Schema.Types.ObjectId[];
        createdAt:Date;
    }
    
    export interface ITogether extends ITogetherDocument {
    }
    
    export interface ITogetherModel extends Model<ITogether> {
    }
    
    export type eventPayload = {
        _id:Schema.Types.ObjectId;
        title:string;
    }
}
