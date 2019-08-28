import { Schema, model, Types } from 'mongoose';
import { TogetherTypes } from 'typings/mongoose/Together.d'

export const togetherRegex = {
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
        type :Schema.Types.ObjectId,
        required: true,
    },
    locationId : {
        type:Schema.Types.ObjectId,
        required:true,
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        required:true,
    },
    // owns : {
    //     type: [{
    //         type : Schema.Types.ObjectId,
    //         ref: 'Together'
    //     }],
    //     default:[]
    // },
    managerIds : {
        type : [{
            type : Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default:[]
    },
    bannedIds : {
        type : [{
            type : Schema.Types.ObjectId,
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
                    type:Schema.Types.ObjectId,
                    default(){
                        return new Types.ObjectId()
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
            type : Schema.Types.ObjectId,
            ref: 'Account'
        }],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}

const TogetherSchema:Schema = new Schema(togetherRegex,{
    timestamps: true
});

export const Together:TogetherTypes.ITogetherModel = model<TogetherTypes.ITogether, TogetherTypes.ITogetherModel>('Together', TogetherSchema);

