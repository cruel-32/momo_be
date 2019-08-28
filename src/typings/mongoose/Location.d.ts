import { Document, Model } from 'mongoose';

declare namespace LocationTypes {
    export interface ILocationDocument extends Document {
        title: string;
        parent: string;
    }
    
    export interface ILocation extends ILocationDocument {
    }
    
    export interface ILocationModel extends Model<ILocation> {
    }
}
