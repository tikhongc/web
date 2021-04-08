
//code for user input when they sign in


const mongoose = require('mongoose');//https://mongoosejs.com/docs/index.html
require('../mongodb/mongoose');//mongoose: https://developer.mozilla.org/zh-TW/docs/Learn/Server-side/Express_Nodejs/mongoose
const validator = require('validator');//https://www.npmjs.com/package/validator
const bcrypt = require('bcryptjs');//https://www.npmjs.com/package/bcrypt

//var passwordValidator = require('password-validator');
//var schema = new passwordValidator();//https://tarunbatra.com/password-validator/5.1.1/

//mongoose它定義了一個schema來表示document的數據結構或者構造函數,Schema允許您定義存儲在每個文檔中的字段，及其驗證要求和默認值。
//Models是從Schema編譯來的構造函數。它們的實例就代表著可以從數據庫保存和讀取的documents。從數據庫創建和讀取document的所有操作都是通過model進行的

//user need to input:1.name 2.password 3.email 6.acdemic year 
//haven't finished: 4.identity: select student or professor 5.select major 

const UserSchema= new mongoose.Schema({//mongoose schematypes:https://mongoosejs.com/docs/schematypes.html

    //user name  : 1.no-break space 2.string type 3.min 3 words 4. must input 5.unique
    name: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        minlength: 1,
    },

    //password: 1.8-18 lengths 2.no breakspace 3.hide in html
    password: {
        type: String,
        required: true,
        //minlength: 8,
       //maxlength:18,
        trim: true,
    },

    //user email  : 1.no-break space 2.string type 3.lowercase 4. must input 5.lowercase 6.unique//after connect to database
    email: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },

    year: {
        type: Number,
        maxlength: 1,
        validate(value) {
            if (value < 0) {
                throw new Error('It should be a postive number')
            }
        }
    },
   
    //store token
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    bio: {
        type: String,
        required: false,
        max: 255
    },

    avatar: {
        type: Buffer
    },
   
    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    },
     //major:{}
    //identity:{}
}, {timestamps: true});

module.exports = UserSchema;