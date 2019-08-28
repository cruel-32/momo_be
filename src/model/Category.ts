import {  Schema, model   } from 'mongoose';
import { CategoryTypes } from 'typings/mongoose/Category.d'

export const categoryRegex = {
    title : {
        type : String,
        match : /^[A-Za-z0-9가-힣\/\-\_\$]{2,12}$/,
        required: [true, '특수문자를 제외한 2~12자가 필요합니다 ($,_,-,는 허용)'],
    },
    parent : {
        type :String,
        required: false,
        default:'root',
    }
}

const CategorySchema:Schema = new Schema(categoryRegex,{
    timestamps: true
});

export const Category:CategoryTypes.ICategoryModel = model<CategoryTypes.ICategory, CategoryTypes.ICategoryModel>('Category', CategorySchema);
