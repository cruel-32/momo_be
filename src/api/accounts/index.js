const Router = require('koa-router');
const accounts = new Router();
const accountsCtrl = require('./accounts.ctrl.js');

accounts.get('/', accountsCtrl.getAccounts); //모든 유저 불러오기
accounts.get('/togethers/:_id', accountsCtrl.getAccountsByTogether); //미구현
accounts.get('/:_id', accountsCtrl.getAccount); //특정 유저 불러오기
accounts.get('/existence/:key/:value', accountsCtrl.getExistence); //특정 유저 존재여부

accounts.post('/', accountsCtrl.createAccount); //회원 가입하기
accounts.post('/auth', accountsCtrl.accountLogin); //회원 로그인

// accounts.delete('/auth', accountsCtrl.accountLogout); //회원 로그아웃
accounts.patch('/:_id', accountsCtrl.patchAccount); //회원 정보 수정
accounts.patch('/:_id/authentication', accountsCtrl.patchAccountAuth); //회원인증

accounts.post('/togethers/:_id', accountsCtrl.joinTogether); //모임 가입하기
accounts.delete('/togethers/:_id', accountsCtrl.outTogether); //모임 탈퇴하기

accounts.delete('/togethers/:togetherId/user/:userId', accountsCtrl.banUserAtTogether); //모임 강퇴시키기


module.exports = accounts;

