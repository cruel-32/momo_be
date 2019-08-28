import Router from 'koa-router';
import togethersController from './togethers_ctrl';
import eventcategoriesController from './togethers_eventcategories_ctrl';
import eventsController from './togethers_events_ctrl';
import managerIdsController from './togethers_managerIds_ctrl';

const togethers = new Router();

togethers.get('/', togethersController.getTogethers); //모임가져오기
togethers.get('/:_id', togethersController.getTogether); //모임 1개 가져오기 (by id)

togethers.post('/', togethersController.createTogether); //모임 생성하기
togethers.put('/:_id', togethersController.patchTogether); //모임 수정하기
togethers.patch('/:_id', togethersController.patchTogether); //모임 수정하기

togethers.get('/:togetherId/eventcategories/', eventcategoriesController.getEventcategories); //벙 카테고리 불러오기
togethers.post('/:togetherId/eventcategories/', eventcategoriesController.createEventcategory); //벙 카테고리 생성하기

togethers.patch('/:togetherId/eventcategories/:_id', eventcategoriesController.patchEventcategory); //벙 카테고리 수정하기
togethers.delete('/:togetherId/eventcategories/:_id', eventcategoriesController.deleteEventcategory); //벙 카테고리 삭제하기


//벙 조회 생성 수정 삭제
togethers.get('/:togetherId/events/', eventsController.getEvents); //모든 벙 불러오기
togethers.get('/:togetherId/events/:_id', eventsController.getEvent); //벙 1개 불러오기

togethers.post('/:togetherId/events/', eventsController.createEvent); //벙 생성하기

togethers.patch('/:togetherId/events/:_id', eventsController.patchEvent); //벙 수정하기
togethers.delete('/:togetherId/events/:_id', eventsController.deleteEvent); //벙 삭제하기

//벙 참석&참석취소하기
togethers.post('/:togetherId/events/:_id/members/:userId', eventsController.joinEvent); //벙 참석하기
togethers.delete('/:togetherId/events/:_id/members/:userId', eventsController.outEvent); //벙 참석 취소하기

//모임 운영진 임명&해임
togethers.post('/:togetherId/managerIds/:_id', managerIdsController.createManager); //운영진 임명하기
togethers.delete('/:togetherId/managerIds/:_id', managerIdsController.deleteManager); //운영진 임명하기


export default togethers;
