const jwtSecret = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

const generateToken = payload =>
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

const decodeToken = token =>
    new Promise(
        (resolve, reject) => {
            jwt.verify(token, jwtSecret, (error, decoded) => {
                if(error) reject(error);
                resolve(decoded);
            });
        }
    );

const jwtMiddleware = async (ctx, next) => {
    // cookie를 삭제
    const token = ctx.cookies.get('access_token') || ctx.headers['access_token'];
    // const token = ctx.headers['access_token']
    if(!token) return next();
    try {
        const decoded = await decodeToken(token); // 토큰을 디코딩 합니다
        // if(Date.now() / 1000 - decoded.iat > 60 * 60 * 24 * 5) {
        //     const {
        //         _id,
        //         thumbnail,
        //         username,
        //     } = decoded;

        //     // ctx.request.access_token = await generateToken({ _id, thumbnail, username, }, 'account');
        //     const access_token = await generateToken({ _id, thumbnail, username, }, 'account');
        //     ctx.cookies.set('access_token', access_token, {
        //         maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
        //         httpOnly: true
        //     });
        // }
        //재발급 로직 당분간 사용x
        ctx.request.user = decoded;
        // return access_token;
    } catch (err) {
        console.log('token validate 실패 : ', err)
        ctx.request.user = null;
    }

    return next();
};

module.exports = {
    generateToken,
    decodeToken,
    jwtMiddleware,
}

