const Router = require('koa-router');
const categories = new Router();
const categoriesCtrl = require('./categories.ctrl.js');

//관리자만 사용할 수 있는 api (모든 카테고리 가져오기 제외)
categories.get('/', categoriesCtrl.getCategories); //모든 카테고리 가져오기
categories.get('/:parentId', categoriesCtrl.getSubCategories); //서브 카테고리 가져오기

categories.post('/', categoriesCtrl.createCategory); //카테고리 생성하기
categories.post('/:parentId', categoriesCtrl.createSubCategory); //서브 카테고리 생성하기

categories.put('/:_id', categoriesCtrl.putCategory); //카테고리 수정하기
categories.patch('/:_id', categoriesCtrl.patchCategory); //카테고리 수정하기
categories.delete('/:_id', categoriesCtrl.deleteCategory); //카테고리 삭제하기

module.exports = categories;

