const {Account, accountSchema, passwordMatch} = require('model/Account');
const {Together, togetherSchema} = require('model/Together');
const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment')
const Transaction = require('mongoose-transactions');
const generateToken = require('lib/token.js').generateToken;
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
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }
    
    try{
        const account = await Account.findOne({
            _id
        }).select("-_salt_ -_key_").populate('owns', 'title').populate('togethers', 'title').exec();
        console.log('account : ', account);
        ctx.body = (user._id != _id) ? await account.hidePersonalOne() : account;
    } catch(msg){
        console.error('msg : ', msg)
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
        deleted: Joi.string(),
        message: Joi.string().max(20),
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

exports.patchAccountAuth = async ctx => {
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
        authentication: Joi.string().required(),
        phone: Joi.number().required(),
        name: Joi.string().regex(/^[가-힣]{2,10}$/),
        birth: Joi.date(),
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
        const {
            _id,
            thumbnail,
            username,
            message
        } = await Account.createAccount(body);

        let access_token = await generateToken({
            _id,
            thumbnail,
            username,
            message
        }, 'account');

        ctx.cookies.set('access_token', access_token, { httpOnly: true, maxAge:1000 * 60 * 60 * 24 * 7});

        ctx.body = {
            _id,
            thumbnail,
            username,
            message,
            access_token
        };
    } catch (msg) {
        ctx.status = 500;
        ctx.body = {msg};
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
            ctx.body = {msg:'존재하지 않는 아이디 입니다'};
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

        const {
            _id,
            thumbnail,
            username,
            message
        } = account

        let access_token = await generateToken({
            _id,
            thumbnail,
            username,
            message
        }, 'account');

        ctx.cookies.set('access_token', access_token, { httpOnly: true, maxAge:1000 * 60 * 60 * 24 * 7});

        console.log('access_token : ', ctx.cookies.get('access_token'));

        ctx.body = {
            thumbnail,
            _id,
            username,
            message,
            access_token
        };
    } catch (msg) {
        console.log('msg : ', msg);
        ctx.status = 500;
        ctx.body = {msg};
    }
}

// exports.accountLogout = ctx => {
//     ctx.cookies.set('access_token', null, {
//         maxAge: 0, 
//         httpOnly: true
//     });
//     ctx.body = {
//         msg : '로그아웃 성공'
//     }
// };

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
        const userInfo = await Account.findById(user._id).exec();
        const limit = 5;
        if(userInfo.authentication === 'N'){
            ctx.status = 400;
            ctx.body = {msg:'실명인증이 필요합니다'};
            return;
        }
        if(userInfo.togethers.length >= limit){
            ctx.status = 400;
            ctx.body = {msg:'최대 5개의 모임만 가입 가능합니다'};
            return;
        }

        const together = await Together.findById(_id);
        if(together){
            const {limit,members,maxAge,minAge} = together;
            const birth = parseInt(moment(userInfo.birth).format('YYYY'));

            if(limit <= members.length){
                ctx.status = 400;
                ctx.body = {msg:'가입 가능한 인원을 초과했습니다'};
                return;
            } else if(members.includes(user._id)){
                ctx.status = 400;
                ctx.body = {msg:'이미 가입한 모임입니다'};
                return;
            } else if(
                birth < parseInt(moment(maxAge).format('YYYY')) ||
                birth > parseInt(moment(minAge).format('YYYY'))
            ) {
                ctx.status = 400;
                ctx.body = {msg:'나이제한이 있습니다'};
                return;
            }

            console.log('maxAge ', parseInt(moment(maxAge).format('YYYY')));
            console.log('minAge ', parseInt(moment(minAge).format('YYYY')));
            console.log('birth ', parseInt(moment(userInfo.birth).format('YYYY')));

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
        console.error('msg : ', msg);
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

exports.banUserAtTogether = async ctx => {
    const { user } = ctx.request;
    const { togetherId, userId } = ctx.params;
    const { ban } = ctx.request.body;

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인이 필요합니다'};
        return;
    }

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(userId)|| !ObjectId.isValid(user._id)) {
        ctx.status = 400;
        ctx.body = {msg:'잘못된 요청입니다'};
        return;
    }

    const transaction = new Transaction();
    try {
        const together = await Together.findById(togetherId);
        const logginedId= user._id;

        if(together){
            const {ownerId, managerIds} = together;

            if(ownerId != logginedId || managerIds.includes(logginedId)){
                ctx.status = 403;
                ctx.body = {msg:'강퇴권한이 없습니다'};
                return;
            }

            if(ownerId != userId){
                ctx.status = 400;
                ctx.body = {msg:'모임장은 강퇴가 불가능 합니다'};
                return;
            }

        } else {
            ctx.status = 404;
            ctx.body = {msg:'해당 모임이 존재하지 않습니다'};
            return;
        }

        let TogetherObj = {
            $pull : {
                members:user._id
            }
        }
        if(ban == 'true' || ban == true){
            TogetherObj.$addToSet = {
                bannedId:userId
            }
        }
        transaction.update('Together', {togetherId}, TogetherObj);

        transaction.update('Account', {_id:user._id}, {
            $pull : {
                togethers:togetherId
            }
        });

        const final = await transaction.run()

        if(final){
            ctx.body = {
                togetherId,
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

