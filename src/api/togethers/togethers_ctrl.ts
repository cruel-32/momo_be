import { Context } from 'koa';
import { Controller } from 'serve/controller';
import { Together } from 'model/Together'
import { Account } from 'model/Account'

class TogethersController extends Controller {
    public getTogethers = async (ctx:Context) => {
        ctx.body = await Together.find().exec()
    }
    
    public getTogether = async (ctx:Context) => {
        try {
            const { _id } = ctx.params;

            this.validateObjectId(_id);

            ctx.body = await Together.findById(_id).populate('members', 'username message thumbnail').exec()
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public patchTogether = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.validateParams(body, {
                title: this.Joi.string().min(5).max(20),
                categoryId: this.Joi.string(),
                locationId: this.Joi.string(),
                message: this.Joi.string(),
                limit: this.Joi.number(),
                image: this.Joi.string(),
                maxAge: this.Joi.date(),
                minAge: this.Joi.date(),
            })

            const together = await Together.findById(_id);
            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, `존재하지 않는 모임입니다`);
            }
            this.authenticateAccessableID(user!._id, together.ownerId);
    
            ctx.body = await Together.findByIdAndUpdate(_id, body, {
                upsert: true,
                new: true
            })
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createTogether = async (ctx:Context) => {
        const transaction = new this.Transaction();

        try {
            const {user, body} = ctx.request;
        
            this.authenticateLoggedUser(user);
            
            if(user){
                const userInfo:any = await Account.findOne({_id:user._id}).exec();
                const maxLen = 1;
        
                if(userInfo.authentication === 'N'){
                    throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, '실명인증이 필요합니다');
                }
                if(userInfo.owns && (userInfo.owns.length >= maxLen)){
                    throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, `최대 ${maxLen}개의 모임을 만들 수 있습니다`);
                }

                this.validateParams(body,{
                    title: this.Joi.string().min(5).max(20).required(),
                    categoryId: this.Joi.string().required(),
                    locationId: this.Joi.string().required(),
                    message: this.Joi.string(),
                    limit: this.Joi.number(),
                    maxAge: this.Joi.date(),
                    minAge: this.Joi.date(),
                })
        
                const {
                    title,
                    categoryId,
                    locationId,
                    message,
                    max,
                } = body;
        
                const createdTogether = transaction.insert('Together', {
                    title,
                    categoryId,
                    locationId,
                    message,
                    ownerId:user._id,
                    max,
                    members:[user._id]
                });
        
                if(!createdTogether){
                    throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR, `모임 생성에 실패했습니다`);
                    
                }
        
                transaction.update('Account', {_id:userInfo._id}, {
                    $addToSet : {
                        owns:createdTogether,
                        togethers:createdTogether
                    }
                });
        
                const final = await transaction.run()
        
                if(final){
                    ctx.body = {
                        msg:'모임을 생성했습니다',
                        togetherId:createdTogether,
                    }
                }
            }
        } catch (error) {
            transaction.clean();
            ctx.app.emit('error', error, ctx);
        }
    }

}

export default new TogethersController();


