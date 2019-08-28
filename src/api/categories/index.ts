import Router from 'koa-router';
import categoriesController from './categories_ctrl';

const categories = new Router();

//관리자만 사용할 수 있는 api (모든 카테고리 가져오기 제외)
categories.get('/', categoriesController.getCategories); //모든 카테고리 가져오기
categories.get('/:parentId', categoriesController.getSubCategories); //서브 카테고리 가져오기

categories.post('/', categoriesController.createCategory); //카테고리 생성하기
categories.post('/:parentId', categoriesController.createSubCategory); //서브 카테고리 생성하기

categories.put('/:_id', categoriesController.putCategory); //카테고리 수정하기
categories.patch('/:_id', categoriesController.patchCategory); //카테고리 수정하기
categories.delete('/:_id', categoriesController.deleteCategory); //카테고리 삭제하기

export default categories;
