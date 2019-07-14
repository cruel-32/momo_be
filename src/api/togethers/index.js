const Router = require('koa-router');
const togethers = new Router();
const togethersCtrl = require('./togethers.ctrl.js');
const eventcategoriesCtrl = require('./togethers.eventcategories.ctrl.js');
const eventsCtrl = require('./togethers.events.ctrl.js');
const managerIdsCtrl = require('./togethers.managerIds.js');


togethers.get('/', togethersCtrl.getTogethers); //모임가져오기
togethers.get('/:_id', togethersCtrl.getTogether); //모임 1개 가져오기 (by id)

togethers.post('/', togethersCtrl.createTogether); //모임 생성하기
togethers.put('/:_id', togethersCtrl.patchTogether); //모임 수정하기
togethers.patch('/:_id', togethersCtrl.patchTogether); //모임 수정하기

togethers.get('/:togetherId/eventcategories/', eventcategoriesCtrl.getEventcategories); //벙 카테고리 불러오기
togethers.post('/:togetherId/eventcategories/', eventcategoriesCtrl.createEventcategory); //벙 카테고리 생성하기

togethers.patch('/:togetherId/eventcategories/:_id', eventcategoriesCtrl.patchEventcategory); //벙 카테고리 수정하기
togethers.delete('/:togetherId/eventcategories/:_id', eventcategoriesCtrl.deleteEventcategory); //벙 카테고리 삭제하기


//벙 조회 생성 수정 삭제
togethers.get('/:togetherId/events/', eventsCtrl.getEvents); //모든 벙 불러오기
togethers.get('/:togetherId/events/:_id', eventsCtrl.getEvent); //벙 1개 불러오기

togethers.post('/:togetherId/events/', eventsCtrl.createEvent); //벙 생성하기

togethers.patch('/:togetherId/events/:_id', eventsCtrl.patchEvent); //벙 수정하기
togethers.delete('/:togetherId/events/:_id', eventsCtrl.deleteEvent); //벙 삭제하기

//벙 참석&참석취소하기
togethers.post('/:togetherId/events/:_id/members/:userId', eventsCtrl.joinEvent); //벙 참석하기
togethers.delete('/:togetherId/events/:_id/members/:userId', eventsCtrl.outEvent); //벙 참석 취소하기

//모임 운영진 임명&해임
togethers.post('/:togetherId/managerIds/:_id', managerIdsCtrl.createManager); //운영진 임명하기
togethers.delete('/:togetherId/managerIds/:_id', managerIdsCtrl.deleteManager); //운영진 임명하기


module.exports = togethers;

