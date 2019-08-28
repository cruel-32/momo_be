import { Schema, model } from 'mongoose';
import crypto from 'crypto';
import {AccountTypes} from 'typings/mongoose/Account.d'
// import {generateToken} from 'lib/token';

export const accountRegex = {
    //required
    email : {
        type: String,
        match : /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i,
        required: [true, '이메일주소가 필요합니다'],
        unique:true,
        trim:true
    },
    username : {
        type : String,
        match : /^[A-Za-z0-9가-힣\-_$]{2,12}$/,
        required: [true, '특수문자를 제외한 2~12자가 필요합니다 ($,_,-,는 허용)'],
        trim:true
    },
    _key_ : {
        type: String,
        required: true,
    },
    _salt_ : {
        type: String,
        required: true,
    },

    //unrequired
    authentication : {
        type:String,
        default:'N'
    },
    birth : {
        type:Date,
    },
    thumbnail: {
        type: String,
        default:'/assets/images/default_profile_thum.png'
    },
    name : {
        type : String,
        match : /^[가-힣]{2,10}$/,
        trim:true
    },
    phone : {
        type: Number,
        match : /^[0-9]{8-12}$/,
        trim:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted : {
        type: String,
        default:'N'
    },
    owns : {
        type: [{
            type : Schema.Types.ObjectId,
            ref: 'Together'
        }],
        default:[]
    },
    managements : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Together'
        }
    ],
    togethers : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Together'
        }
    ],
    message: {
        type:String,
        max: 20
    },
    social : {
        naver : {
            id : String,
            accessToken :String
        },
        facebook : {
            id : String,
            accessToken :String
        },
        google : {
            id : String,
            accessToken :String
        },
        kakao : {
            id : String,
            accessToken : String
        },
    },
}

const AccountSchema:Schema = new Schema(accountRegex, {
    timestamps: true
});

const cryptoHash = (password:any) => 
    new Promise((resolve, reject)=>{
        const buf = crypto.randomBytes(64);
        crypto.pbkdf2(password, buf.toString('base64'), parseInt(process.env.ENCRYPTION_REPEAT || ""), 64, 'sha512', (err, key) => {
            if(err){
                reject(err);
            } else {
                resolve({
                    _salt_ : buf.toString('base64'),
                    _key_ : key.toString('base64'),
                })
            }
        });
    });

AccountSchema.statics.findByEmail = function(email:string) {
    // 객체에 내장되어있는 값을 사용 할 때는 객체명.키 이런식으로 쿼리하면 됩니다
    return this.findOne({
        email
    }).exec();
};

AccountSchema.statics.findByEmailOrPhone = function({email, phone}:{email:string,phone:number}) {
    return this.findOne({
        // $or 연산자를 통해 둘중에 하나를 만족하는 데이터를 찾습니다
        $or: [
            { email },
            { phone }
        ]
    }).exec();
};
//{username:string,email:string,password:string}
AccountSchema.statics.createAccount = async function({ username, email, password }:AccountTypes.createPayload) {
    const {_salt_, _key_, err}:any = await cryptoHash(password);
    if(_salt_ && _key_){
        const account = new this({
            username,
            email,
            _salt_,
            _key_,
        });
        return account.save();
    } else if(err){
        return err
    }
};


AccountSchema.methods.validatePassword = async ({__salt__, __key__, password}:AccountTypes.hashPayload) =>
    new Promise((resolve)=>{
        crypto.pbkdf2(password, __salt__, parseInt(process.env.ENCRYPTION_REPEAT||""), 64, 'sha512', (err, key) => {
            if(err){
                resolve({
                    success:false,
                    msg:'에러가 발생했습니다'
                });
            } else if(key.toString('base64') === __key__){
                resolve({
                    success:true
                })
            } else {
                resolve({
                    success:false,
                    msg:'비밀번호가 틀렸습니다',
                })
            }
        });
    });


AccountSchema.methods.hidePersonalOne = async function(){
    if(this.phone){
        this.phone = this.phone.toString().slice(6);
    }
    if(this.email){
        this.email = this.email.match(/@.+/)[0];
    }
    return this;
}

// AccountSchema.methods.generateToken = async function() {
//     // JWT 에 담을 내용
//     const payload = {
//         _id: this._id,
//         thumbnail: this.thumbnail,
//         username : this.username,
//         message : this.message
//     };

//     return generateToken(payload);
// };


export const Account:AccountTypes.IAccountModel = model<AccountTypes.IAccount, AccountTypes.IAccountModel>('Account', AccountSchema);
export const passwordMatch:RegExp =  /^(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])(?=.*[0-9]).{8,16}$/;