const {Account, accountSchema, passwordMatch} = require('model/Account');
const {Together, togetherSchema} = require('model/Together');
const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId;
const Transaction = require('mongoose-transactions')
// const adminId = process.env.ADMIN_ID;

exports.getAccounts = async ctx => {
    try {
        ctx.body = await Account.find({},[
            'thumbnail', 'username', 'message',
        ]).exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.getAccountsByTogether = async ctx => {
    const {_id} = ctx.request.body;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    try {
        ctx.body = await Account.find({
            togethers : [
                _id
            ]
        },[
            'thumbnail', 'username', 'message',
        ]).exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.getAccount = async ctx => {
    const { _id } = ctx.params;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }
    
    try{
        ctx.body = await Account.findOne({
            _id
        }).select("-_salt_ -_key_").populate('owns', 'title').populate('togethers', 'title').exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.patchAccount = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;
    const { body } = ctx.request;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인이 필요합니다'};
        return;
    } else if(_id != user._id) {
        ctx.status = 403;
        ctx.body = {msg:'본인 아이디만 수정가능합니다'};
        return;
    }

    const validation = Joi.validate(body, Joi.object().keys({
        username: Joi.string().regex(accountSchema.username.match),
        thumbnail: Joi.string(),
        name: Joi.string().regex(/^[가-힣]{2,10}$/),
        deleted: Joi.string(),
        message: Joi.string().max(20)
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }
    
    try{
        ctx.body = await Account.findByIdAndUpdate(_id,body,{upsert: true, new:true}).select("-_salt_ -_key_").exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createAccount = async ctx => {
    const { body } = ctx.request;

    const validation = Joi.validate(body, Joi.object().keys({
        username: Joi.string().regex(accountSchema.username.match),
        email: Joi.string().regex(accountSchema.email.match),
        password: Joi.string().regex(passwordMatch)
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        let account = await Account.createAccount(body);
        let token = await account.generateToken();

        ctx.cookies.set('access_token', token, { httpOnly: true, maxAge:1000 * 60 * 60 * 24 * 7});
        ctx.body = {
            thumbnail: account.thumbnail,
            _id: account._id,
            username: account.username,
            message: account.message,
        };
    } catch (err) {
        ctx.status = 500;
        ctx.body = {error};
    }

}

exports.getExistence = async ctx => {
    const { key, value } = ctx.params;
    try {
        if(key === 'email' || key === 'phone'){
            let account = await Account.findByEmailOrPhone({
                [key] : value
            });
            ctx.body = {
                exists: account != null
            };
        } else {
            ctx.status = 400;
            ctx.body = {msg:`${key} - 지원하지 않는 검색어입니다`};
        }
    } catch (msg) {
        ctx.status = 500;
        ctx.body = {msg};
    }
};

exports.accountLogin = async ctx =>{
    const { email, password } = ctx.request.body; 

    const validation = Joi.validate({email, password}, Joi.object().keys({
        email: Joi.string().regex(accountSchema.email.match),
        password: Joi.string().regex(passwordMatch)
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        let account = await Account.findByEmail(email);
        if(!account) {
            ctx.status = 403;
            ctx.body = {msg:'존재하지 않습니다'};
            return;
        } else {
            const {success,msg} = await account.validatePassword({
                reqSalt: account._salt_,
                reqKey: account._key_,
                password
            });
            if(!success){
                ctx.status = 403;
                ctx.body = {msg};
                return;
            }
        }

        let token = await account.generateToken();
        ctx.cookies.set('access_token', token, {
            httpOnly: process.env.NODE_ENV !== 'development', maxAge: 1000 * 60 * 60 * 24 * 7
        });
        ctx.body = {
            thumbnail: account.thumbnail,
            _id: account._id,
            username: account.username,
            message: account.message,
        };
    } catch (msg) {
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.accountLogout = ctx => {
    ctx.cookies.set('access_token', null, {
        maxAge: 0, 
        httpOnly: true
    });
    ctx.body = {
        msg : '로그아웃 성공'
    }
};

exports.joinTogether = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인이 필요합니다'};
        return;
    }
    
    if(!ObjectId.isValid(_id) || !ObjectId.isValid(user._id)) {
        ctx.status = 400;
        ctx.body = {msg:'요청이 잘못되었습니다'};
        return;
    }

    const transaction = new Transaction();
    try {
        console.log('try : ');

        const userInfo = await Account.findById(user._id).exec();
        const limit = 5;
        if(userInfo.togethers.length >= limit){
            ctx.status = 400;
            ctx.body = {msg:'최대 5개의 모임만 가입 가능합니다'};
            return;
        }


        const together = await Together.findById(_id);
        if(together){
            const {limit,members} = together;
            if(limit <= members.length){
                ctx.status = 400;
                ctx.body = {msg:'가입 가능한 인원을 초과했습니다'};
                return;
            } else if(members.includes(user._id)){
                ctx.status = 400;
                ctx.body = {msg:'이미 가입한 모임입니다'};
                return;
            }
        }

        transaction.update('Together', {_id}, {
            $addToSet : {
                members:user._id
            }
        });

        transaction.update('Account', {_id:user._id}, {
            $addToSet : {
                togethers:_id
            }
        });

        const final = await transaction.run()

        if(final){
            ctx.body = {
                _id,
            };
        } else {
            ctx.status = 500;
            ctx.body = {msg:'가입에 실패했습니다'};
        }
    } catch(msg){
        transaction.clean()
        ctx.status = 500;
        ctx.body = {msg};
    }
}


exports.outTogether = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인이 필요합니다'};
        return;
    }

    if(!ObjectId.isValid(_id) || !ObjectId.isValid(user._id)) {
        ctx.status = 400;
        ctx.body = {msg:'잘못된 요청입니다'};
        return;
    }

    const transaction = new Transaction();
    try {
        const together = await Together.findById(_id);
        if(together){
            const {ownerId} = together;
            if(ownerId === user._id){
                ctx.status = 400;
                ctx.body = {msg:'모임장은 탈퇴할 수 없습니다'};
                return;
            }
        }

        transaction.update('Together', {_id}, {
            $pull : {
                members:user._id
            }
        });

        transaction.update('Account', {_id:user._id}, {
            $pull : {
                togethers:_id
            }
        });

        const final = await transaction.run()

        if(final){
            ctx.body = {
                _id,
            };
        } else {
            ctx.status = 500;
            ctx.body = {msg:'실패했습니다'};
        }
    } catch(msg){
        transaction.clean()
        ctx.status = 500;
        ctx.body = {msg};
    }
}

