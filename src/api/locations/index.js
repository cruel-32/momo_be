const Router = require('koa-router');
const locations = new Router();
const locationsCtrl = require('./locations.ctrl.js');

//관리자만 사용할 수 있는 api (모든 장소 가져오기 제외)
locations.get('/', locationsCtrl.getLocations); //모든 장소 가져오기
locations.get('/:parentId', locationsCtrl.getSubLocations); //서브 장소 가져오기

locations.post('/', locationsCtrl.createLocation); //장소 생성하기
locations.post('/:parentId', locationsCtrl.createSubLocation); //서브 장소 생성하기

locations.put('/:_id', locationsCtrl.putLocation); //장소 수정하기
locations.patch('/:_id', locationsCtrl.patchLocation); //장소 수정하기
locations.delete('/:_id', locationsCtrl.deleteLocation); //장소 삭제하기

module.exports = locations;

