import { Schema } from 'mongoose';
import { Context } from 'koa';
import { Controller } from 'serve/controller';
import { Category, categoryRegex }  from 'model/Category';

class CategoriesController extends Controller {

    public getCategories = async (ctx:Context) => {
        try {
            ctx.body = await Category.find().exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public getSubCategories = async (ctx:Context) => {
        try {
            const { parentId } = ctx.params;
            ctx.body = await Category.find({parentId}).exec();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createCategory = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { title } = body;

            this.authenticateLoggedUser(user);
            this.validateParams(body, {
                title: this.Joi.string().regex(categoryRegex.title.match),
            })
            
            this.authenticateAccessableID(user!._id, this.adminId, '관리자만 생성할 수 있습니다');
            const category = new Category({title});
            ctx.body = await category.save();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public createSubCategory = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { parentId } = ctx.params;
            const { title } = body;

            this.validateObjectId(parentId);
            this.authenticateAccessableID(user!._id, this.adminId, '관리자 아이디로 로그인하세요');
            this.validateParams(body, {
                title: this.Joi.string().regex(categoryRegex.title.match),
            })

            const category = new Category({title, parent:parentId,});
            ctx.body = await category.save();
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public putCategory = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateAccessableID(user!._id, this.adminId, '관리자 아이디로 로그인하세요');
            this.validateParams(body, {
                title: this.Joi.string().regex(/^[A-Za-z0-9가-힣\/\-\_\$]{2,12}$/),
                parent: this.Joi.string()
            })
       
            ctx.body = await Category.findByIdAndUpdate(_id, body, {
                upsert: true,
                new: true
            })
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public patchCategory = async (ctx:Context) => {
        try {
            const { user, body } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateAccessableID(user!._id, this.adminId, '관리자 아이디로 로그인하세요');
            this.validateParams(body, {
                title: this.Joi.string().regex(/^[A-Za-z0-9가-힣\/\-\_\$]{2,12}$/),
                parent: this.Joi.string()
            })
        
            ctx.body = await Category.findByIdAndUpdate(_id, body, {
                upsert: true,
                new: true
            });
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
    public deleteCategory = async (ctx:Context) => {
        try {
            const { user } = ctx.request;
            const { _id } = ctx.params;
        
            this.validateObjectId(_id);
            this.authenticateAccessableID(user!._id, this.adminId, '관리자 아이디로 로그인하세요');
       
            const result = await Category.findByIdAndRemove(_id).exec();
            ctx.body = result;
        } catch (error) {
            ctx.app.emit('error', error, ctx);
        }
    }
    
}

export default new CategoriesController();



