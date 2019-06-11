const {Location, locationSchema} = require('model/Location');
const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId
const adminId = process.env.ADMIN_ID;


exports.getLocations = async ctx => {
    try {
        ctx.body = await Location.find().exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.getSubLocations = async ctx => {
    const { parentId } = ctx.params;

    if(!ObjectId.isValid(parentId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }
    
    try {
        ctx.body = await Location.find({
            parentId
        }).exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createLocation = async ctx => {
    const { user } = ctx.request;
    const { title } = ctx.request.body;
    
    if(user._id != adminId){
        ctx.status = 403;
        ctx.body = {msg:'관리자 아이디로 로그인하세요'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().regex(locationSchema.title.match),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }
    
    try {
        const location = new Location({
            title, 
        });
        ctx.body = await location.save();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createSubLocation = async ctx => {
    const { user } = ctx.request;
    const { parentId } = ctx.params;
    const { title } = ctx.request.body;

    if(!ObjectId.isValid(parentId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().regex(locationSchema.title.match),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        const location = new Location({
            title, parent:parentId,
        });
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자 아이디로 로그인하세요'};
            return;
        }
        ctx.body = await location.save();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.putLocation = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().regex(/^[A-Za-z0-9가-힣\/\-\_\$]{2,12}$/),
        parent: Joi.string()
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자 아이디로 로그인하세요'};
            return;
        }
        ctx.body = await Location.findByIdAndUpdate(_id, ctx.request.body, {
            upsert: true,
            new: true
        })
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.patchLocation = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    try {
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자 아이디로 로그인하세요'};
            return;
        }
        ctx.body = await Location.findByIdAndUpdate(_id, ctx.request.body, {
            upsert: true,
            new: true
        });
    } catch (msg) {
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.deleteLocation = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;

    if(!ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    if(user._id != adminId){
        ctx.status = 403;
        ctx.body = {msg:'관리자 아이디로 로그인하세요'};
        return;
    }

    try {
        ctx.body = await Location.findByIdAndRemove(_id).exec();;
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

