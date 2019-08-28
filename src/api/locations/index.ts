import Router from 'koa-router';
import locationsController from './locations_ctrl';

const locations = new Router();

//관리자만 사용할 수 있는 api (모든 장소 가져오기 제외)
locations.get('/', locationsController.getLocations); //모든 장소 가져오기
locations.get('/:parentId', locationsController.getSubLocations); //서브 장소 가져오기

locations.post('/', locationsController.createLocation); //장소 생성하기
locations.post('/:parentId', locationsController.createSubLocation); //서브 장소 생성하기

locations.put('/:_id', locationsController.putLocation); //장소 수정하기
locations.patch('/:_id', locationsController.patchLocation); //장소 수정하기
locations.delete('/:_id', locationsController.deleteLocation); //장소 삭제하기

export default locations;

