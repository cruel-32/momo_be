const {Event} = require('model/Event');
const {Together} = require('model/Together');
const Joi = require('@hapi/joi');
const moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getEvents = async ctx => {
    const { user, query } = ctx.request;
    const { togetherId } = ctx.params;

    // console.log('user : ', user);

    if(!user) {
        ctx.status = 403;
        ctx.body = {msg:'로그인이 필요합니다'};
        return;
    }

    if(!ObjectId.isValid(togetherId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(query, Joi.object().keys({
        categoryId: Joi.string(),
        locationCode: Joi.string(),
        date: Joi.date(),
        startdate: Joi.date(),
        enddate: Joi.date(),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    try {
        // const together = await Together.findById(togetherId);

        let {
            date, categoryId, locationCode, startdate, enddate
        } = query;
        
        // console.log('date : ', date);
        // console.log('typeof date : ', typeof date);
        // console.log('startdate : ', startdate);
        // console.log('categoryId : ', categoryId);
        // console.log('locationCode : ', locationCode);
        // console.log('enddate : ', enddate);

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
                    $gte: moment(now).format("YYYY-MM-DD"),
                }
            })
        }

    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.getEvent = async ctx => {
    const { user } = ctx.request;
    const { togetherId, _id } = ctx.params;

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    try {
        const together = await Together.findById(togetherId);
        if(!together.members.includes(user._id)){
            ctx.status = 403;
            ctx.body = {msg:'모임원이 아니면 볼 수 없습니다'};
            return;
        }

        ctx.body = await Event.findById(_id);
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.createEvent = async ctx => {
    const { user, body } = ctx.request;
    const { togetherId } = ctx.params;

    if(!ObjectId.isValid(togetherId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(body, Joi.object().keys({
        title: Joi.string().min(5).max(20).required(),
        categoryCode: Joi.string().required(),
        locationCode: Joi.string().required(),
        message: Joi.string().required(),
        date: Joi.date().required(),
        togetherId: Joi.string().required(),
        limit:Joi.number().required(),
    }));

    if(validation.error) {
        ctx.status = 400;
        ctx.body = validation.error;
        return;
    }

    console.log('date : ', body.date);
    console.log('date moment : ', moment(body.date).format('YYYYMMDD hh:mm'));

    try {
        const together = await Together.findById(togetherId);
        
        if(!together){
            ctx.status = 204;
            ctx.body = {
                msg:'존재하지 않는 모임입니다'
            }
            return
        }

        if(user._id != together.ownerId && !together.managerIds.includes(user._id)){
            ctx.status = 403;
            ctx.body = {
                msg:'모임장 또는 운영진 아이디로 로그인 하세요'
            }
            return
        }
        const event = new Event(body);
        ctx.body = await event.save();

    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.patchEvent = async ctx => {
    console.log('patchEvent');
    const { user } = ctx.request;
    const { body } = ctx.request;
    const { togetherId, _id } = ctx.params;

    if(!ObjectId.isValid(togetherId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const validation = Joi.validate(body, Joi.object().keys({
        title: Joi.string().min(5).max(20),
        categoryId: Joi.string(),
        locationCode: Joi.string(),
        message: Joi.string(),
        date: Joi.date(),
        togetherId: Joi.string(),
        limit:Joi.number(),
    }));

    console.log('date : ', body.date);
    console.log('date moment : ', moment(body.date).format('YYYY-MM-DD hh:mm'));

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

        if(user._id != together.ownerId && !together.managerIds.includes(user._id)){
            ctx.status = 403;
            ctx.body = {
                msg:'모임장 또는 운영진 아이디로 로그인 하세요'
            }
            return
        }
        ctx.body = await Event.findOneAndUpdate({togetherId,_id}, body, {
            upsert: true,
            new: true
        })
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}

exports.deleteEvent = async ctx => {
    console.log('deleteEvent');
    const { user } = ctx.request;
    const { togetherId, _id } = ctx.params;

    if(!ObjectId.isValid(togetherId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

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

        if(user._id != together.ownerId && !together.managerIds.includes(user._id)){
            ctx.status = 403;
            ctx.body = {
                msg:'모임장 또는 운영진 아이디로 로그인 하세요'
            }
            return
        }
        ctx.body = await Event.findOneAndRemove({togetherId,_id}, {
            upsert: true,
            new: true
        })
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg};
    }
}


exports.joinEvent = async ctx => {
    const { user } = ctx.request;
    const { togetherId, _id, userId } = ctx.params;


    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인 하세요'};
        return;
    }

    if(userId != user._id){
        ctx.status = 403;
        ctx.body = {msg:'본인 아이디가 아닙니다'};
        return;
    }

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id) || !ObjectId.isValid(userId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    try {
        const together = await Together.findById(togetherId).exec();

        if(!together.members.includes(userId)){
            ctx.status = 403;
            ctx.body = {msg:'모임원이 아닙니다'};
            return;
        }

        const event = await Event.findOne({togetherId,_id}).exec();

        if(event.members.length >= event.limit){
            ctx.status = 403;
            ctx.body = {msg:'참여가능 인원을 초과했습니다'};
            return;
        }
        
        ctx.body = await Event.findOneAndUpdate({togetherId,_id},{
            $addToSet : {
                members:user._id
            }
        },{upsert: true, new: true}).exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg}
    }
}

exports.outEvent = async ctx => {
    console.log('outEvent');

    const { user } = ctx.request;
    const { togetherId, _id, userId } = ctx.params;

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인 하세요'};
        return;
    }

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id) || !ObjectId.isValid(userId)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    try {
        const together = await Together.findById(togetherId).exec();

        if(!together.members.includes(userId)){
            ctx.status = 403;
            ctx.body = {msg:'모임원이 아닙니다'};
            return;
        }

        if(together.ownerId != user._id){ //운영자가 아님
            if(!together.managerIds.includes(user._id)){ //운영진도 아님
                if(userId != user._id){ //본인 아이디도 아님
                    ctx.status = 403;
                    ctx.body = {msg:'취소 권한이 없습니다'};
                    return;
                }
            } else if(together.ownerId == userId){//운영진이긴 한데 강퇴하려는 아이디가 운영자임
                ctx.status = 403;
                ctx.body = {msg:'운영자를 거부할 수 없습니다'};
                return;
            }
        }

        ctx.body = await Event.findOneAndUpdate({togetherId,_id},{
            $pull : {
                members:user._id
            }
        },{upsert: true, new: true}).exec();
    } catch(msg){
        ctx.status = 500;
        ctx.body = {msg}
    }
}