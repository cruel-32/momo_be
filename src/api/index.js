const Router = require('koa-router');
const api = new Router();
const account = require('./accounts');
const category = require('./categories');
const together = require('./togethers');
const location = require('./locations');

api.use('/accounts', account.routes());
api.use('/categories', category.routes());
api.use('/locations', location.routes());
api.use('/togethers', together.routes());
module.exports = api;

