import { Document, Model } from 'mongoose';

declare namespace CategoryTypes {
    export interface ICategoryDocument extends Document {
        title: string;
        parent: string;
    }
    
    export interface ICategory extends ICategoryDocument {
    }
    
    export interface ICategoryModel extends Model<ICategory> {
    }
}
