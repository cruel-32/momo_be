import { Context } from 'koa';
import { Controller } from 'serve/controller';
import { Event } from 'model/Event'
import { Together } from 'model/Together'

class TogethersController extends Controller {
    public getEvents = async (ctx:Context) => {
        try {
            const { user, query } = ctx.request;
            const { togetherId } = ctx.params;
        
            this.validateObjectId(togetherId);
            this.authenticateLoggedUser(user);
            this.validateParams(query, {
                categoryId: this.Joi.string(),
                locationCode: this.Joi.string(),
                date: this.Joi.date(),
                startdate: this.Joi.date(),
                enddate: this.Joi.date(),
            });
        
            let {
                date, categoryId, locationCode, startdate, enddate
            } = query;
            
    
            if(date){
                ctx.body = await Event.findByDate({
                    date, categoryId, locationCode, togetherId
                });
                return
            } else if(startdate && enddate){
                ctx.body = await Event.findByRange({
                    startdate, enddate, categoryId, locationCode, togetherId
                });
                return
            }
            else {
                const now = new Date();
        
                ctx.body = await Event.find({
                    togetherId,
                    date : {
                        $gte: this.moment(now).format("YYYY-MM-DD"),
                    }
                })
            }
    
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public getEvent = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { togetherId, _id } = ctx.params;

            this.validateObjectId(togetherId);
            this.validateObjectId(_id);
    
            const together = await Together.findById(togetherId);

            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 모임입니다');
            }

            this.authenticateAccessableID(user!._id, together.members, '모임원이 아니면 볼 수 없습니다');

            ctx.body = await Event.findById(_id);
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createEvent = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { togetherId } = ctx.params;

            this.validateObjectId(togetherId);
            this.authenticateLoggedUser(user);
            this.validateParams(body, {
                title: this.Joi.string().min(5).max(20).required(),
                categoryCode: this.Joi.string().required(),
                locationCode: this.Joi.string().required(),
                message: this.Joi.string().required(),
                date: this.Joi.date().required(),
                togetherId: this.Joi.string().required(),
                limit:this.Joi.number().required(),
            })
        
            const together = await Together.findById(togetherId);
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 모임입니다');
            }

            this.authenticateAccessableID(user!._id, [together.ownerId, ...together.managerIds], '모임장 또는 운영진 아이디로 로그인 하세요');
    
            const event = new Event(body);
            ctx.body = await event.save();
    
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public patchEvent = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { togetherId, _id } = ctx.params;

            this.validateObjectId(togetherId);
            this.validateParams(body, {
                title: this.Joi.string().min(5).max(20),
                categoryId: this.Joi.string(),
                locationCode: this.Joi.string(),
                message: this.Joi.string(),
                date: this.Joi.date(),
                togetherId: this.Joi.string(),
                limit:this.Joi.number(),
            })
        
            const together = await Together.findById(togetherId);
            
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 모임입니다');
            }

            this.authenticateAccessableID(user!._id, [together.ownerId, ...together.managerIds], '모임장 또는 운영진 아이디로 로그인 하세요');

            ctx.body = await Event.findOneAndUpdate({togetherId,_id}, body, {
                upsert: true,
                new: true
            })
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public deleteEvent = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { togetherId, _id } = ctx.params;
        
            this.validateObjectId(togetherId);
        
            const together = await Together.findById(togetherId);
            
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 모임입니다');
            }

            this.authenticateAccessableID(user!._id, [together.ownerId, ...together.managerIds], '모임장 또는 운영진 아이디로 로그인 하세요');

            ctx.body = await Event.findOneAndRemove({togetherId,_id});
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    
    public joinEvent = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { togetherId, _id, userId } = ctx.params;
        
            this.authenticateLoggedUser(user);
            this.validateObjectId(_id);
            this.validateObjectId(togetherId);
            this.validateObjectId(userId);
            this.authenticateAccessableID(user!._id, userId, '본인 아이디가 아닙니다');

            const together = await Together.findById(togetherId).exec();

            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 모임입니다');
            }
    
            this.authenticateAccessableID(user!._id, together.members, '모임원이 아닙니다');

            const event = await Event.findOne({togetherId,_id}).exec();
    
            if(!event){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 이벤트입니다');
            }

            if(event.members.length >= event.limit){
                throw new this.ErrorWithCode(this.httpStatusCode.FORBIDDEN, '참여가능 인원을 초과했습니다');
            }

            if(user){
                ctx.body = await Event.findOneAndUpdate({togetherId,_id},{
                    $addToSet : {
                        members:user._id
                    }
                },{upsert: true, new: true}).exec();
            }
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public outEvent = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { togetherId, _id, userId } = ctx.params;

            this.validateObjectId(_id);
            this.validateObjectId(togetherId);
            this.validateObjectId(userId);
            this.authenticateLoggedUser(user);
            this.authenticateAccessableID(user!._id!, _id);
        
            const together = await Together.findById(togetherId).exec();

            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, '존재하지 않는 모임입니다');
            }
    
            this.authenticateAccessableID(userId, together.members, '모임원이 아닙니다');

            this.authenticateAccessableID(user!._id!, [together.ownerId, ...together.managerIds]);

            if(user){
                if(together.ownerId == userId){//운영진이긴 한데 강퇴하려는 아이디가 운영자임
                    throw new this.ErrorWithCode(this.httpStatusCode.FORBIDDEN, '운영자를 거부할 수 없습니다');
                }
                ctx.body = await Event.findOneAndUpdate({togetherId,_id},{
                    $pull : {
                        members:user._id
                    }
                },{upsert: true, new: true}).exec();
            }
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }


}

export default new TogethersController();


