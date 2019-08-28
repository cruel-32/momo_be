import { Context } from 'koa';
import { Controller } from 'serve/controller';
import { Location, locationRegex } from 'model/Location'

class LocationsController extends Controller {
    public getLocations = async (ctx:Context) => {
        try {
            ctx.body = await Location.find().exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public getSubLocations = async (ctx:Context) => {
        try {
            const { parentId } = ctx.params;
            this.validateObjectId(parentId);
            ctx.body = await Location.find({parentId}).exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createLocation = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { title } = body;
            
            this.authenticateAccessableID(user!._id, this.adminId);
            this.validateParams(body, {
                title: this.Joi.string().regex(locationRegex.title.match),
            })
        
            const location = new Location({title});
            ctx.body = await location.save();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createSubLocation = async (ctx:Context) => {
        try {

            const { user,body } = ctx.request;
            const { parentId } = ctx.params;
            const { title } = body;
        
            this.validateObjectId(parentId);
            this.authenticateAccessableID(user!._id, this.adminId);
            this.validateParams(body, {
                title: this.Joi.string().regex(locationRegex.title.match),
            })
    
            const location = new Location({
                title, parent:parentId,
            });

            ctx.body = await location.save();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public putLocation = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateAccessableID(user!._id, this.adminId);
            this.validateParams(body, {
                title: this.Joi.string().regex(/^[A-Za-z0-9가-힣\/\-\_\$]{2,12}$/),
                parent: this.Joi.string()
            })

            ctx.body = await Location.findByIdAndUpdate(_id, body, {
                upsert: true,
                new: true
            })
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public patchLocation = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateAccessableID(user!._id, this.adminId);
    
            ctx.body = await Location.findByIdAndUpdate(_id, body, {
                upsert: true,
                new: true
            });
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public deleteLocation = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateAccessableID(user!._id, this.adminId);
    
            ctx.body = await Location.findByIdAndRemove(_id).exec();;
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
}

export default new LocationsController();


