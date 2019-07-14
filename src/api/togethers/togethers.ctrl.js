const {Together} = require('model/Together');
const {Account} = require('model/Account');
const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId;
const Transaction = require('mongoose-transactions')

exports.getTogethers = async ctx => {
    ctx.body = await Together.find().exec()
}

exports.getTogether = async ctx => {
    const { _id } = ctx.params;
    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        return;
    }
    try {
        ctx.body = await Together.findById(_id).populate('members', 'username message thumbnail').exec()
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.patchTogether = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().min(5).max(20),
        categoryId: Joi.string(),
        locationId: Joi.string(),
        message: Joi.string(),
        limit: Joi.number(),
        image: Joi.string(),
        maxAge: Joi.date(),
        minAge: Joi.date(),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        const together = await Together.findById(_id);

        if(together.ownerId != user._id){
            ctx.status = 403;
            ctx.body = {msg:'운영자 아이디로 로그인하세요'};
            return;
        }

        ctx.body = await Together.findByIdAndUpdate(_id, ctx.request.body, {
            upsert: true,
            new: true
        })
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createTogether = async ctx => {
    const {user, body} = ctx.request;
    
    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인이 필요합니다'};
        return;
    }

    const transaction = new Transaction();

    try {
        const userInfo = await Account.findOne({_id:user._id}).exec();
        const maxLen = 1;
        if(userInfo.authentication === 'N'){
            ctx.status = 400;
            ctx.body = {msg:'실명인증이 필요합니다'};
            return;
        }
        if(userInfo.owns && (userInfo.owns.length >= maxLen)){
            ctx.status = 400;
            ctx.body = {msg:`최대 ${maxLen}개의 모임을 만들 수 있습니다.`};
            return;
        }

        const validation = Joi.validate(body, Joi.object().keys({
            title: Joi.string().min(5).max(20).required(),
            categoryId: Joi.string().required(),
            locationId: Joi.string().required(),
            message: Joi.string(),
            limit: Joi.number(),
            maxAge: Joi.date(),
            minAge: Joi.date(),
        }));

        if(validation.error) {
            ctx.status = 400;
            ctx.body = validation.error;
            return;
        }

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
            ctx.status = 500;
            ctx.body = {msg:'모임 생성에 실패했습니다.'};
            return;
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
    } catch(msg){
        transaction.clean()
        ctx.status = 500;
        ctx.body = {msg};
    }
}

