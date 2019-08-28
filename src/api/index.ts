
import Router from 'koa-router';

import account from './accounts/index';
import category from './categories/index';
import together from './togethers/index';
import location from './locations/index';

const api = new Router();
api.use('/accounts', account.routes());
api.use('/categories', category.routes());
api.use('/locations', location.routes());
api.use('/togethers', together.routes());

export default api;

