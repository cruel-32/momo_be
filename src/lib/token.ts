import jwt from 'jsonwebtoken';
import { Context } from 'koa';
import { TokenTypes } from 'typings/type'

const jwtSecret:string = process.env.JWT_SECRET || '';

export const generateToken = (payload:TokenTypes.TokenPayload):Promise<string> =>
    new Promise(
        (resolve, reject) => {
            jwt.sign(
                payload,
                jwtSecret,
                {
                    expiresIn: '7d'
                }, (error, token) => {
                    if(error) reject(error);
                    resolve(token);
                }
            );
        }
    );

export const decodeToken = (token:string):Promise<TokenTypes.TokenCookie> =>
    new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtSecret, (error:any, decoded:any) => {
                if(error) reject(error);
                resolve(decoded);
            });
        }
    );

export const jwtMiddleware = async (ctx:Context, next:()=>Promise<any>) => {
    const token = ctx.cookies.get('access_token');
    if(!token) return next();
    try {
        const decoded:TokenTypes.TokenCookie = await decodeToken(token);
        if(Date.now() / 1000 - decoded.iat > 60 * 60 * 24 * 5) {
            const {_id, thumbnail, username, message}:TokenTypes.TokenPayload = decoded;
            const access_token:string = await generateToken({ _id, thumbnail, username, message});

            ctx.cookies.set('access_token', access_token, {
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
                httpOnly: true
            });
        }
        ctx.request.user = decoded;
    } catch (err) {
        console.log('token validate 실패 : ', err)
        ctx.request.user = null;
    }

    return next();
};
