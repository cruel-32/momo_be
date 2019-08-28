import { Context } from 'koa';
import { Controller } from 'serve/controller';
import {Together, togetherRegex} from 'model/Together'

class TogethersController extends Controller {
    public getEventcategories = async (ctx:Context) => {
        try {
            const { togetherId } = ctx.params;
            ctx.body = await Together.findById(togetherId,'eventcategories');
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createEventcategory = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { title } = body;
            const { togetherId } = ctx.params;

            this.validateObjectId(togetherId);
            this.validateParams(body, {
                title: this.Joi.string().min(2).max(10).required(),
            })

            const together = await Together.findById(togetherId);
            
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT , `존재하지 않는 모임입니다`);
            }

            this.authenticateAccessableID(user!._id, [this.adminId, together.ownerId]);

            ctx.body = await Together.findByIdAndUpdate(togetherId,{
                $addToSet : {
                    eventcategories:{
                        title
                    }
                }
            },{new:true,upsert:true}) ;
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public patchEventcategory = async (ctx:Context) => {
        try {
            const { user,body } = ctx.request;
            const { title } = body;
            const { togetherId, _id } = ctx.params;
        
            this.validateObjectId(togetherId);
            this.validateObjectId(_id);
            this.authenticateLoggedUser(user);
            this.validateParams(body, {
                title: this.Joi.string().min(2).max(10).required(),
            })
        
            const together = await Together.findById(togetherId);
    
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT , `존재하지 않는 모임입니다`);
            }
    
            this.authenticateAccessableID(user!._id, [this.adminId, together.ownerId]);

            const {eventcategories}:any = await Together.findByIdAndUpdate(togetherId,{
                $set : {
                    "eventcategories.$[i].title" : title,
                },
            },{
                arrayFilters: [{
                    "i._id" : _id
                }],
                new:true,
                upsert:false,
            }) ;

            if(!eventcategories){
                throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR , `수정 실패했습니다`);
            }

            ctx.body = {_id, eventcategories}
    
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public deleteEventcategory = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { togetherId, _id } = ctx.params;

            this.validateObjectId(togetherId);
            this.validateObjectId(_id);

            const together = await Together.findById(togetherId);
    
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT , `존재하지 않는 모임입니다`);
            }

            this.authenticateAccessableID(user!._id, [this.adminId, together.ownerId]);
    
            const result =  await Together.findByIdAndUpdate(togetherId,{
                $pull : {
                    eventcategories : {
                        _id
                    }
                }
            },{new:true}) ;

            if(!result){
                throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR , `삭제 실패했습니다`);
            }

            ctx.body = result.eventcategories;
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }

}
export default new TogethersController();

