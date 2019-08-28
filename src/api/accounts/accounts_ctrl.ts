import { Context } from 'koa';
import { Controller } from 'serve/controller';
import { Account, accountRegex, passwordMatch } from 'model/Account';
import { Together } from 'model/Together';
import { TokenTypes } from 'typings/type'

class AccountsController extends Controller {

    public getAccounts = async (ctx:Context) => {
        try {
            ctx.body = await Account.find({}, ['thumbnail', 'username', 'message']).exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    public getAccountsByTogether = async (ctx:Context) => {
        try {
            const {_id} = ctx.request.body;
            this.validateObjectId(_id);
            ctx.body = await Account.find({togethers : [_id]}, ['thumbnail', 'username', 'message']).exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    public getAccount = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { _id } = ctx.params;

            this.validateObjectId(_id);

            const account = await Account.findOne({_id})
                            .select("-_salt_ -_key_")
                            .populate('owns', 'title')
                            .populate('togethers', 'title').exec();
            if(account){
                ctx.body = user && (user._id != _id) ? await account.hidePersonalOne() : account;
            }
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }

    public patchAccount = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateLoggedUser(user);
            this.authenticateAccessableID(user!._id, _id);
            this.validateParams(body, {
                username: this.Joi.string().regex(accountRegex.username.match),
                thumbnail: this.Joi.string(),
                deleted: this.Joi.string(),
                message: this.Joi.string().max(20),
            })
            
            ctx.body = await Account.findByIdAndUpdate(_id,body,{upsert: true, new:true})
                                    .select("-_salt_ -_key_").exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }

    public patchAccountAuth = async (ctx:Context) => {
        try{
            const { user } = ctx.request;
            const { _id } = ctx.params;
            const { body } = ctx.request;
        
            this.validateObjectId(_id);
            this.authenticateLoggedUser(user);
            this.authenticateAccessableID(user!._id, _id);
            this.validateParams(body, {
                authentication: this.Joi.string().required(),
                phone: this.Joi.number().required(),
                name: this.Joi.string().regex(/^[가-힣]{2,10}$/),
                birth: this.Joi.date(),
            })

            ctx.body = await Account.findByIdAndUpdate(_id,body,{upsert: true, new:true}).select("-_salt_ -_key_").exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createAccount = async (ctx:Context) => {
        try {
            const { body } = ctx.request;

            this.validateParams(body, {
                username: this.Joi.string().regex(accountRegex.username.match),
                email: this.Joi.string().regex(accountRegex.email.match),
                password: this.Joi.string().regex(passwordMatch)
            })
        
            const {_id, thumbnail, username, message} = await Account.createAccount(body);
            const tokenPayload:TokenTypes.TokenPayload = {_id, thumbnail, username, message};
            const access_token:string = await this.generateToken(tokenPayload);
    
            ctx.cookies.set('access_token', access_token, { httpOnly: true, maxAge:1000 * 60 * 60 * 24 * 7});
            ctx.body = tokenPayload;
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public getExistence = async (ctx:Context) => {
        try {
            const { key, value } = ctx.params;
            if(key === 'email' || key === 'phone'){
                let account = await Account.findByEmailOrPhone({
                    [key] : value
                });
                ctx.body = {
                    exists: account != null
                };
            } else {
                throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, `${key} - 지원하지 않는 검색어입니다`);
            }
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    };
    
    public accountLogin = async (ctx:Context) =>{
        try {
            const { email, password } = ctx.request.body; 

            this.validateParams({email, password}, {
                email: this.Joi.string().required().regex(accountRegex.email.match),
                password: this.Joi.string().required().regex(passwordMatch)
            })
        
            const account = await Account.findByEmail(email);
    
            if(!account) {
                throw new this.ErrorWithCode(this.httpStatusCode.FORBIDDEN, '존재하지 않는 계정입니다');
            } else {
                const {success} = await account.validatePassword({
                    __salt__: account._salt_,
                    __key__: account._key_,
                    password
                });
                
                if(!success){
                    throw new this.ErrorWithCode(this.httpStatusCode.FORBIDDEN, '패스워드를 확인하세요');
                }
            }
    
            const {_id, thumbnail, username, message} = account
            const tokenPayload:TokenTypes.TokenPayload = {_id,thumbnail, username, message};
            const access_token = await this.generateToken(tokenPayload);
    
            ctx.cookies.set('access_token', access_token, { httpOnly: true, maxAge:1000 * 60 * 60 * 24 * 7});
            ctx.body = tokenPayload;
    
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public accountLogout = (ctx:Context) => {
        try {
            ctx.cookies.set('access_token', undefined, {
                maxAge: 0, 
                httpOnly: true
            });
            ctx.body = {
                msg : '로그아웃 성공'
            }
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    };
    
    public joinTogether = async (ctx:Context) => {
        const transaction = new this.Transaction();
        try {
            const { user } = ctx.request;
            const { _id } = ctx.params;

            this.validateObjectId(_id);
            this.authenticateLoggedUser(user);

            if(user){
                const userInfo = await Account.findById(user._id).exec();
                const limit = 5;

                if(userInfo) {
                    if(userInfo.authentication === 'N'){
                        throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, '인증되지 않은 계정입니다');
                    }
                    if(userInfo.togethers.length >= limit){
                        throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, '최대 5개의 모임을 가입할 수 있습니다');
                    }
            
                    const together = await Together.findById(_id);
                    if(together){
                        const {limit,members,maxAge,minAge} = together;
                        const birth = parseInt(this.moment(userInfo.birth).format('YYYY'));

                        if(limit <= members.length){
                            throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, '인원제한을 초과했습니다');
                        } else if(members.includes(user._id)){
                            throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, '이미 가입한 모임입니다');
                        } else if(
                            birth < parseInt(this.moment(maxAge).format('YYYY')) ||
                            birth > parseInt(this.moment(minAge).format('YYYY'))
                        ) {
                            throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST, '나이제한이 있습니다');
                        }
                    }
            
                    transaction.update('Together', {_id}, {
                        $addToSet : {members:user._id}
                    });
            
                    transaction.update('Account', {_id:user._id}, {
                        $addToSet : {togethers:_id}
                    });
            
                    const final = await transaction.run()
            
                    if(final){
                        ctx.body = {_id};
                    } else {
                        throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR,'가입에 실패했습니다');
                    }
                }
            }
        } catch (error) {
            transaction.clean();
            ctx.app.emit('error', error, ctx);
        }
    }
    
    
    public outTogether = async (ctx:Context) => {
        const transaction = new this.Transaction();
        try {
            const { user } = ctx.request;
            const { _id } = ctx.params;

            this.authenticateLoggedUser(user);
            this.authenticateAccessableID(user!._id, _id);
    
            const together = await Together.findById(_id);

            if(user){
                if(together){
                    const {ownerId} = together;
                    if(ownerId === user._id){
                        throw new this.ErrorWithCode(this.httpStatusCode.BAD_REQUEST,'모임장은 탈퇴할 수 없습니다');
                    }
                }
        
                transaction.update('Together', {_id}, {
                    $pull:{members:user._id}
                });
        
                transaction.update('Account', {_id:user._id}, {
                    $pull : {togethers:_id}
                });
        
                const final = await transaction.run()
        
                if(final){
                    ctx.body = {_id};
                } else {
                    throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR);
                }
            }
        } catch (error) {
            transaction.clean();
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public banUserAtTogether = async (ctx:Context) => {
        const transaction = new this.Transaction();
        try {
            const { user, body } = ctx.request;
            const { togetherId, userId } = ctx.params;
            const { ban } = body;

            this.validateObjectId(togetherId);
            this.validateObjectId(userId);
            this.authenticateLoggedUser(user);

            if(user){
                const together = await Together.findById(togetherId);
                const logginedId= user._id;
        
                if(together){
                    const {ownerId, managerIds} = together;
                    this.authenticateAccessableID(logginedId, [ownerId, ...managerIds])
                    if(ownerId != userId){
                        throw new this.ErrorWithCode(this.httpStatusCode.FORBIDDEN, '모임장은 강퇴가 불가능 합니다');
                    }
                } else {
                    throw new this.ErrorWithCode(this.httpStatusCode.NOT_FOUND);
                }
        
                let TogetherObj:any = {
                    $pull : {members:user._id}
                }
        
                if(ban == 'true' || ban == true){
                    TogetherObj.$addToSet = {
                        bannedId:userId
                    }
                }
        
                transaction.update('Together', {togetherId}, TogetherObj);
                transaction.update('Account', {_id:user._id}, {
                    $pull : {togethers:togetherId}
                });
        
                const final = await transaction.run();
                if(final){
                    ctx.body = {togetherId};
                } else {
                    throw new this.ErrorWithCode(this.httpStatusCode.INTERNAL_SERVER_ERROR);
                }
            }
        } catch (error) {
            transaction.clean();
            ctx.app.emit('error', error, ctx);
        }
    }
}

export default new AccountsController();
