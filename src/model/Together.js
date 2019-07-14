const mongoose = require('mongoose'); //
const ObjectId = mongoose.Types.ObjectId;

const togetherSchema = {
    title : {
        type : String,
        required: true,
        max:20,
        min:5,
    },
    image: {
        type: String,
        required:[true, '대표이미지를 설정해주세요'],
        default:'/assets/images/default_image_thum.png'
    },
    categoryId : {
        type :String,
        required: true,
    },
    locationId : {
        type:String,
        required:true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
    },
    // owns : {
    //     type: [{
    //         type : mongoose.Schema.Types.ObjectId,
    //         ref: 'Together'
    //     }],
    //     default:[]
    // },
    managerIds : {
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default:[]
    },
    bannedIds : {
        type : [{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default:[]
    },
    subscribe: {
        type: String,
        default:'N',
    },
    message: {
        type: String,
        max:100,
    },
    limit: {
        type:Number,
        default:50,
        min:5,
        max:300
    },
    maxAge : {
        type: Date,
        default: new Date(1950,0,1),
    },
    minAge : {
        type: Date,
        default: Date.now,
    },
    eventcategories : {
        type : [
            {
                _id: {
                    type:mongoose.Schema.Types.ObjectId,
                    default(){
                        return new ObjectId()
                    }
                },
                title: {
                    type:String,
                    required:true,
                    min:2,
                    max:10
                } 
            },
        ],
        default:[]
    },
    members : {
        type: [{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}
const Together = new mongoose.Schema(togetherSchema,{
    timestamps: true
});

module.exports = {
    Together : mongoose.model('Together', Together),
    togetherSchema
};
