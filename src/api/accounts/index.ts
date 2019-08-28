import Router from 'koa-router';
import accountsController from './accounts_ctrl';

const accounts = new Router();

accounts.get('/', accountsController.getAccounts); //모든 유저 불러오기
accounts.get('/togethers/:_id', accountsController.getAccountsByTogether); //미구현
accounts.get('/:_id', accountsController.getAccount); //특정 유저 불러오기
accounts.get('/existence/:key/:value', accountsController.getExistence); //특정 유저 존재여부

accounts.post('/', accountsController.createAccount); //회원 가입하기
accounts.post('/auth', accountsController.accountLogin); //회원 로그인
accounts.delete('/auth', accountsController.accountLogout); //회원 로그아웃

accounts.patch('/:_id', accountsController.patchAccount); //회원 정보 수정
accounts.patch('/:_id/authentication', accountsController.patchAccountAuth); //회원인증

accounts.post('/togethers/:_id', accountsController.joinTogether); //모임 가입하기
accounts.delete('/togethers/:_id', accountsController.outTogether); //모임 탈퇴하기

accounts.delete('/togethers/:togetherId/user/:userId', accountsController.banUserAtTogether); //모임 강퇴시키기


export default accounts;


