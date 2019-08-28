import { Context } from 'koa';

const whitelist:string[] = [
    'http://192.168.0.4:13354', //승승 작업실
    'http://192.168.35.108:13354', //승승 노트북
    'http://192.168.35.197:13354', //승승 노트북
    'http://172.30.1.22:13354/', //승승 카페
    'https://s-store.herokuapp.com', //승승 카페
];  

export const originConfig = {
    origin: (ctx:Context) =>{
      const requestOrigin = ctx.headers.origin //ctx.accept.headers.origin;
      if(!whitelist.includes(requestOrigin)){
        ctx.status = 400;
        ctx.body = {msg:`🙈 ${requestOrigin} is not a valid origin`};
        return;
      }
      return requestOrigin;
    },
    credentials : true,
    maxAge : 7200,
    allowMethods : ['GET','HEAD','PUT','POST','DELETE','PATCH','OPTIONS'],
    allowHeaders: ['Content-Type','Authorization', 'Accept','Origin', 'momo-actions', 'content-length'],
}

export class HttpStatusCode {
  readonly OK:number = 200;
  readonly CREATED:number = 201;
  readonly ACCEPTED:number = 202;
  readonly NON_AUTHORITATIVE_INFORMATION:number = 203;
  readonly NO_CONTENT:number = 204;
  
  readonly NOT_MODIFIED:number = 304;

  readonly BAD_REQUEST:number = 400;
  readonly FORBIDDEN:number = 403;
  readonly NOT_FOUND:number = 404;
  readonly METHOD_NOT_ALLOWED:number = 405;
  readonly NOT_ACCEPTABLE:number = 406;
  readonly REQUEST_TIMEOUT:number = 408;
  readonly CONFLICT:number = 409;
  
  readonly INTERNAL_SERVER_ERROR:number = 500;

  getDefaultText(CODE:number):string{
    let text = '';
    switch(CODE){
      case 200 :
        text = '요청에 성공했습니다';
        break;
      case 201 :
        text = '생성 성공했습니다';
        break;
      case 202 :
        text = '허용 되었습니다';
        break;
      case 203 :
        text = '제한된 정보만 표시됩니다';
        break;
      case 204 :
        text = '데이터가 없습니다';
        break;
      case 304 :
        text = '수정되지 않았습니다';
        break;
      case 400 :
        text = '잘못된 요청입니다';
        break;
      case 403 :
        text = '접근이 금지되었습니다';
        break;
      case 404 :
        text = '페이지를 찾을 수 없습니다';
        break;
      case 405 :
        text = '허용되지 않은 접근 방법입니다';
        break;
      case 406 :
        text = '권한이 업습니다';
        break;
      case 408 :
        text = '요청시간을 초과했습니다';
        break;
      case 409 :
        text = '충돌이 발생했습니다';
        break;
      case 500 :
        text = '서버에러가 발생했습니다';
        break;
    }
    return text
  }

}

export const httpStatusCode = new HttpStatusCode();