import {  Schema, model   } from 'mongoose';
import moment from 'moment';
import { EventTypes } from 'typings/mongoose/Event.d'

export const eventRegex = {
    togetherId:{
        type : Schema.Types.ObjectId,
        required: true
    },
    title : {
        type : String,
        required: true,
        max:20,
        min:5,
    },
    date : {
        type:Date,
        required: true
    },
    categoryCode : {
        type :String,
        required: true
    },
    locationCode : {
        type :String,
        required: true
    },
    limit : {
        type:Number,
        required: true
    },
    message: {
        type: String,
        max:50,
    },
    members : {
        type: [{
            type : Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default:[]
    },
}
const eventSchema:Schema = new Schema(eventRegex,{
    timestamps: true
});

eventSchema.statics.findByDate = function({date, categoryId, locationCode, togetherId}:any) {
    const params:any = {
        togetherId,
    };
    const parseDate = moment(date);
    if(date){
        params.date = parseDate.format('YYYY-MM-DD')
    }
    if(categoryId){
        params['categoryId'] = categoryId;
    }
    if(locationCode){
        params['locationCode'] = locationCode;
    }
    return this.find(params).exec();
};

eventSchema.statics.findByRange = function({startdate, enddate, categoryId, locationCode, togetherId}:any) {
    const params:any = {
        togetherId,
        date : moment(new Date()).format('YYYY-MM-DD')
    };
    const parseStartdate = moment(startdate);
    const parseEnddate = moment(enddate);

    if(startdate && enddate){
        params.date = {
            $gte : parseStartdate.format('YYYY-MM-DD'),
            $lte : parseEnddate.format('YYYY-MM-DD'),
        }
    }
    if(categoryId){
        params['categoryId'] = categoryId;
    }
    if(locationCode){
        params['locationCode'] = locationCode;
    }
    return this.find(params).exec();
};


export const Event:EventTypes.IEventModel = model<EventTypes.IEvent, EventTypes.IEventModel>('event', eventSchema);
