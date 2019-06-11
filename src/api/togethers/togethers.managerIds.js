const {Together} = require('model/Together');
const ObjectId = require('mongoose').Types.ObjectId;
const Transaction = require('mongoose-transactions')

exports.createManager = async ctx => {
    const { user } = ctx.request;
    const { togetherId, _id } = ctx.params;

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인 하세요'};
        return;
    }

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const transaction = new Transaction();

    try {
        const together = await Together.findById(togetherId).exec();

        if(together.managerIds.includes(_id)){
            ctx.status = 403;
            ctx.body = {msg:'이미 운영진 입니다'};
            return;
        }

        if(together.ownerId != user._id){
            ctx.status = 403;
            ctx.body = {msg:'모임장 아이디로 로그인 하세요'};
            return;
        }
        
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
    } catch(msg){
        transaction.clean()
        ctx.status = 500;
        ctx.body = {msg}
    }
}

exports.deleteManager = async ctx => {
    const { user } = ctx.request;
    const { togetherId, _id } = ctx.params;

    if(!user){
        ctx.status = 403;
        ctx.body = {msg:'로그인 하세요'};
        return;
    }

    if(!ObjectId.isValid(togetherId) || !ObjectId.isValid(_id)) {
        ctx.status = 400;
        ctx.body = {msg:'올바른 요청이 아닙니다'};
        return;
    }

    const transaction = new Transaction();

    try {
        const together = await Together.findById(togetherId).exec();

        if(!together.managerIds.includes(_id)){
            ctx.status = 403;
            ctx.body = {msg:'운영진이 아닙니다'};
            return;
        }

        if(together.ownerId != user._id){
            if(_id != user._id){
                ctx.status = 403;
                ctx.body = {msg:'운영진 본인 아이디로 로그인 하세요'};
                return;
            }
            ctx.status = 403;
            ctx.body = {msg:'모임장 아이디로 로그인 하세요'};
            return;
        }
        
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
            ctx.status = 500;
            ctx.body = {msg:'가입에 실패했습니다'};
        }
    } catch(msg){
        transaction.clean()
        ctx.status = 500;
        ctx.body = {msg}
    }
}