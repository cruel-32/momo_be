import koa from 'koa';
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import cors from '@koa/cors'
import api from 'api/index'
import logger from 'koa-logger';
import { jwtMiddleware } from 'lib/token';
import { originConfig } from 'config'

class App {
  public app:koa;
  public router:Router;

  constructor(){
    this.app = new koa();
    this.router = new Router();
    this.setMiddlewares();
    this.setRoutes();
  }

  private setMiddlewares(){
    this.app.use(logger());
    this.app.use(cors(originConfig));
    this.app.use(bodyParser());
    this.app.use(jwtMiddleware);
  }

  private setRoutes(){
    this.router.use('/api', api.routes());
    this.app.use(this.router.routes()).use(this.router.allowedMethods());
  }

}

export default new App().app;
