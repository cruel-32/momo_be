import { Context } from 'koa';
import { Controller } from 'serve/controller';
import { Together } from 'model/Together'
import { Types } from 'mongoose';

class TogethersMngController extends Controller {
    public createManager = async (ctx:Context) => {
        const transaction = new this.Transaction();
        try {
            const { user } = ctx.request;
            const { togetherId, _id } = ctx.params;

            this.validateObjectId(_id);
            this.validateObjectId(togetherId);
            this.authenticateLoggedUser(user);

            const together = await Together.findById(togetherId).exec();

            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, `존재하지 않는 모임입니다`);
            }

            if(together.managerIds.includes(_id)){
                throw new this.ErrorWithCode(this.httpStatusCode.FORBIDDEN, `이미 운영진 입니다`);
            }
    
            this.authenticateAccessableID(user!._id, together.ownerId, '모임장 아이디로 로그인 하세요');
            
            transaction.update('Together', {_id:togetherId}, {
                $addToSet : {
                    managerIds:_id
                }
            });
    
            transaction.update('Account', {_id}, {
                $addToSet : {
                    managements:togetherId
                }
            });
    
            const final = await transaction.run();
    
            if(final){
                ctx.body = {
                    msg : '성공했습니다'
                };
            } else {
                ctx.status = 500;
                ctx.body = {msg:'가입에 실패했습니다'};
            }
        } catch (error) {
            transaction.clean()
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public deleteManager = async (ctx:Context) => {
        const transaction = new this.Transaction();
        try {
            const { user } = ctx.request;
            const { togetherId, _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.validateObjectId(togetherId);
            this.authenticateLoggedUser(user);
        
            const together = await Together.findById(togetherId).exec();

            if(!together){
                throw new this.ErrorWithCode(this.httpStatusCode.NO_CONTENT, `존재하지 않는 모임입니다`);
            }
    
            this.authenticateAccessableID(user!._id, [together.ownerId, ...together.managerIds]);
            
            transaction.update('Together', {_id:togetherId}, {
                $pull : {
                    managerIds:_id
                }
            });
    
            transaction.update('Account', {_id}, {
                $pull : {
                    managements:togetherId
                }
            });
    
            const final = await transaction.run();
    
            if(final){
                ctx.body = {
                    msg : '성공했습니다'
                };
            } else {
                throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR, `요청에 실패했습니다`);
            }
        } catch(msg){
            transaction.clean()
            throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR, `요청에 실패했습니다`);
        }
    }

}

export default new TogethersMngController();

