const mongoose = require('mongoose'); //
const moment = require('moment'); //
const eventSchema = {
    togetherId:{
        type :mongoose.Schema.Types.ObjectId,
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
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default:[]
    },
}
const event = new mongoose.Schema(eventSchema,{
    timestamps: true
});

event.statics.findByDate = function({date, categoryId, locationCode, togetherId}) {
    console.log('findByDate date : ', date);
    console.log('findByRange togetherId : ', togetherId)
    const params = {
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
    console.log('params : ', params);
    return this.find(params).exec();
};

event.statics.findByRange = function({startdate, enddate, categoryId, locationCode, togetherId}) {
    console.log('findByRange startdate : ', startdate)
    console.log('findByRange enddate : ', enddate)
    console.log('findByRange togetherId : ', togetherId)
    const params = {
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
    console.log('params : ', params);
    return this.find(params).exec();
};


module.exports = {
    Event : mongoose.model('event', event),
    eventSchema
};
