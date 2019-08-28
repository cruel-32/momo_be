import { Document, Model, Schema } from 'mongoose';

declare namespace EventTypes {
    export interface IEventDocument extends Document {
        togetherId:Schema.Types.ObjectId;
        title:string;
        date:Date;
        categoryCode:String;
        locationCode:String;
        limit:Number;
        message:String;
        members:Schema.Types.ObjectId[];
    }
    
    export interface IEvent extends IEventDocument {

    }
    
    export interface IEventModel extends Model<IEvent> {
        findByDate(params:datePayload):IEventModel;
        findByRange(params:rangePayload):IEventModel;
    }

    export type datePayload = {
        date:Date;
        categoryId:string;
        locationCode:string;
        togetherId:string;
    }

    export type rangePayload = {
        startdate:Date;
        enddate:Date;
        categoryId:string;
        locationCode:string;
        togetherId:string;
    }
    
}
