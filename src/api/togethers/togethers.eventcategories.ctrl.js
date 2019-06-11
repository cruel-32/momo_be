const {Together, togetherSchema} = require('model/Together');
const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getEventcategories = async ctx => {
    const { togetherId } = ctx.params;
    try {
        ctx.body = await Together.findById(togetherId,'eventcategories');
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createEventcategory = async ctx => {
    const { user } = ctx.request;
    const { title } = ctx.request.body;
    const { togetherId } = ctx.params;

    if(!ObjectId.isValid(togetherId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().min(2).max(10).required(),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        const together = await Together.findById(togetherId);
        
        if(!together){
            ctx.status = 204;
            ctx.body = {
                msg:'존재하지 않는 모임입니다'
            }
            return
        }

        if(user._id != together.ownerId){
            ctx.status = 403;
            ctx.body = {
                msg:'모임장 아이디로 로그인 하세요'
            }
            return
        }

        ctx.body = await Together.findByIdAndUpdate(togetherId,{
            $addToSet : {
                eventcategories:{
                    title
                }
            }
        },{new:true,upsert:true}) ;
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.patchEventcategory = async ctx => {
    const { user } = ctx.request;
    const { title } = ctx.request.body;
    const { togetherId, _id } = ctx.params;

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().min(2).max(10).required(),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        const together = await Together.findById(togetherId);

        if(!together){
            ctx.status = 204;
            ctx.body = {
                msg:'존재하지 않는 모임입니다'
            }
            return
        }

        if(user._id != together.ownerId){
            ctx.status = 403;
            ctx.body = {
                msg:'모임장 아이디로 로그인 하세요'
            }
            return
        }

        ctx.body = await Together.findByIdAndUpdate(togetherId,{
            $set : {
                "eventcategories.$[i].title" : title,
            },
        },{
            multi: false,
            arrayFilters: [{
                "i._id" : _id
            }],
            new:true,
            upsert:true
        }) ;

    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.deleteEventcategory = async ctx => {
        const { user } = ctx.request;
        const { togetherId, _id } = ctx.params;
    
        if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id)) {
            ctx.status = 400;
            ctx.body = {msg:'올바른 요청이 아닙니다'};
            return;
        }
    
        try {
            const together = await Together.findById(togetherId);
    
            if(!together){
                ctx.status = 204;
                ctx.body = {
                    msg:'존재하지 않는 모임입니다'
                }
                return
            }
    
            if(user._id != together.ownerId){
                ctx.status = 403;
                ctx.body = {
                    msg:'모임장 아이디로 로그인 하세요'
                }
                return
            }

            // $pull : {
            //     togethers:togetherId
            // }
    
            ctx.body = await Together.findByIdAndUpdate(togetherId,{
                $pull : {
                    eventcategories : {
                        _id
                    }
                }
            },{multi:true,new:true}) ;
    
        } catch(msg){
            ctx.status = 500;
            ctx.body = {msg};
        }
    }
