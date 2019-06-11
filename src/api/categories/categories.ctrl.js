const {Category, categorySchema} = require('model/Category');
const Joi = require('@hapi/joi');
const ObjectId = require('mongoose').Types.ObjectId;
const adminId = process.env.ADMIN_ID;

exports.getCategories = async ctx => {
    try {
        ctx.body = await Category.find().exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.getSubCategories = async ctx => {
    const { parentId } = ctx.params;

    try {
        ctx.body = await Category.find({
            parentId
        }).exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createCategory = async ctx => {
    const { user } = ctx.request;
    const { title } = ctx.request.body;

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().regex(categorySchema.title.match),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    const category = new Category({
        title, 
    });
    
    try {
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자만 생성할 수 있습니다'};
            return;
        }
        ctx.body = await category.save();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createSubCategory = async ctx => {
    const { user } = ctx.request;
    const { parentId } = ctx.params;
    const { title } = ctx.request.body;

    if(!ObjectId.isValid(parentId)) {
        ctx.status = 400;
        ctx.body = {msg:'잘못된 요청입니다'};
        return;
    }

    const validation = Joi.validate(ctx.request.body, Joi.object().keys({
        title: Joi.string().regex(categorySchema.title.match),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }
    
    try {
        const category = new Category({
            title, parent:parentId,
        });
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자 아이디로 로그인하세요'};
            return;
        }
        ctx.body = await category.save();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.putCategory = async ctx => {
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
        ctx.body = {msg};
        return;
    }

    try {
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자 아이디로 로그인하세요'};
            return;
        }
        ctx.body = await Category.findByIdAndUpdate(_id, ctx.request.body, {
            upsert: true,
            new: true
        })
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.patchCategory = async ctx => {
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
        ctx.body = await Category.findByIdAndUpdate(_id, ctx.request.body, {
            upsert: true,
            new: true
        });
    } catch (err) {
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.deleteCategory = async ctx => {
    const { user } = ctx.request;
    const { _id } = ctx.params;
    try {
        if(user._id != adminId){
            ctx.status = 403;
            ctx.body = {msg:'관리자 아이디로 로그인하세요'};
            return;
        }
        const result = await Category.findByIdAndRemove(_id).exec();
        ctx.body = result;
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

