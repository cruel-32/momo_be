import mongoose from 'mongoose';

export default {
    async connect(URI:string){
        try {
            console.log('URI : ', URI);
            await mongoose.connect(URI,{
                useCreateIndex: true,
                useNewUrlParser: true,
                useFindAndModify:false,
            });
            console.log(`Successfully connected to mongodb`);
        } catch(err){
            console.error(err);
        }
    }
}