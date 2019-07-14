require('dotenv').config(); // .env 파일에서 환경변수 불러오기

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();
const port = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;
const api = require('./api');
const mongoose = require('mongoose');
const { jwtMiddleware } = require('lib/token');
const cors = require('@koa/cors');

const whitelist = [
  'http://192.168.0.4:13354', //승승 작업실
  'http://192.168.35.108:13354', //승승 노트북
  'http://192.168.35.197:13354', //승승 노트북
  'http://172.30.1.22:13354/', //승승 카페
];

mongoose.Promise = global.Promise; // Node 의 네이티브 Promise 사용
mongoose.connect(MONGO_URI,{
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify:false,
}).then(response => {
  console.log(`Successfully connected to mongodb`);
}
).catch(msg => {
  console.error(msg);
});

const funcNames = ["info", "log", "warn", "error"];
const colors = ["\x1b[32m", "\x1b[34m", "\x1b[33m", "\x1b[31m"];

funcNames.forEach((funcName,idx)=>{
  const color = colors[idx];
  let oldFunc = console[funcName];
  console[funcName] = function () {
    let args = Array.prototype.slice.call(arguments);
    if(args.length) {
      args = [color + args[0]].concat(args.slice(1), "\x1b[0m");
    }
    oldFunc.apply(null, args);
  };
});

// const checkOriginAgainstWhitelist = (ctx) =>{
//   const requestOrigin = ctx.accept.headers.origin;
//   if(!whitelist.includes(requestOrigin)){
//     ctx.status = 400;
//     ctx.body = {msg:`🙈 ${requestOrigin} is not a valid origin`};
//     return;
//   }
//   return requestOrigin;
// }

// app.use(cors({ origin: checkOriginAgainstWhitelist }));
app.use(cors()); //당분간 모든 요청 허용

// logger
app.use(async (ctx, next) => {
  // console.log('ctx.headers : ', ctx.headers);
  await next();
  // if(ctx.request.access_token){
  //   console.log('재발급');
  //   const {access_token} = ctx.request;
  //   ctx.body = {
  //     ...ctx.body,
  //     access_token
  //   }
  // }
  const rt = ctx.response.get('X-Response-Time');
  console.log(`로깅테스트 ${ctx.method} ${ctx.url} - ${rt}. cookies : ${ctx.cookies.get('access_token')}`);
  // console.log(`로깅테스트 ${ctx.method} ${ctx.url} - ${rt}.`);
  // ctx.headers.access_token : ${ctx.headers.access_token}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  ctx.set('X-Response-Time', `${Date.now() - start}ms`);
});

app.use(bodyParser()); //라우터보다 상단에 위치
app.use(jwtMiddleware);

//router 등록
router.use('/api', api.routes());
app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.info("Info is green.");
  console.log("Log is blue.");
  console.warn("Warn is orange.");
  console.error("Error is red.");
  console.info("--------------------");
  console.info(`momo application launched at http://localhost:${port} This api server is allowed for heroku server${whitelist.reduce((list,white)=>`${list} and ${white}`,``)}`);
});

