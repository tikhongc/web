//a Router API file
//file to store and manipulate user data and output a router

require('../mongodb/mongoose');
const express = require('express');

const bcrypt = require('bcryptjs');//https://www.npmjs.com/package/bcrypt
const crypto = require('crypto-js');//https://www.npmjs.com/package/crypto-js

const UserModel = require('./UserModel');

//const multer = require('multer');
//const sharp = require('sharp');
//const {check} = require('express-validator');

const {WelcomeEmail, RecoveryEmail} = require('../User_System/method/email');
const authentication=require('../User_System/method/authentication');


const User = new express.Router();     //creating a new router

//const {update} = require('./UserModel');

//POST：提交資料，新增一筆新的資料（如果存在會新增一筆新的）
//PUT：更新一筆資料，如果存在這筆資就會覆蓋過去
//PATCH：部分更新資料
//DELETE：刪除資料

//User log system:
//1.User Signup
//2.Uer Login  
//3.Uer Logout 
//4.User Recovery (server side)


//post usermodel on body
//Handle requests to submit data from the creation form
// need to check unique email also
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
  
 User.post('/user_create', async(req, res)=> {
    const newUser = new UserModel({
        name: req.body.username,
        email: req.body.newEmail,
        password: req.body.newPassword,
        year: req.body.year,
    });
    if (!validateEmail(req.body.newEmail))
        res.redirect('/registration.html?invalid=2');
else{
    try{
         await newUser.save();//save user
         console.log("Created");
        WelcomeEmail(req.body.newEmail, req.body.username);     //send welcome email
        const token = await newUser.Token();        //generate a token for the saved user and send back both toke and user
        res.redirect('/redirection.html');
       //res.send({newUser,token});
    }catch(error){
      res.redirect('/redirection.html');
      //res.send(error);
    }
}
})

 //for user to log in //need a login page
 User.post('/login',async(req,res)=>{
    try{
         //compare user email and password in database and stored as const      
         const {email, password } = req.body;
         
         const user = await UserModel.findOne({ email : email });
         if (!user) {
             //if error:not user be found
            //res.send('account does not exist!');
            return res.redirect('/login.html?loginError=1');
            //user.PasswordReset();
        } 
        const isMatch = await bcrypt.compare(password, user.password);//hash password
        if (!isMatch) {    
          //then compare hashed password with password stored in database
          return res.send('Incorrect password!');
        }
         //const user = await User.login(email, password);//login_authentication
        //reuse token generate 
        const token = await user.Token();
        console.log("Login Successfully.")
        //res.send(currentUser);
        res.redirect('/main.html');
        //res.send({ user, token });
        //hide the private user data    
    }catch(error){
       res.status(400);//bad request
       res.send(error);
    }

})

User.post('/logout',authentication,async(req,res)=>{
   try{
     //remove token  when log out 
    req.user.tokens = [];
    await req.user.save();       //save user and send back information
    res.send();
   }catch(error){
    res.status(500);//bad request
    res.send(error);
   }
})

 
 //User management:(server side)

 //1.fetch all user inforation
 //2.fetch user information by searching _id
 //3.update user information by searching _id
 //4.delete user information by searching _id
 //5.get user authentication information

//for user to get own profile
User.get('/profile', authentication, async (req, res) => {
    res.send(req.user);
})


//When a client needs to replace an existing Resource entirely, they can use PUT. 
//When they're doing a partial update, they can use HTTP PATCH.
//update user by id
User.patch('/update',authentication,async(req,res)=>{
    //only allow to update the atrribute included in user model
    const up = Object.keys(req.body);
    const allowupdate=['name','password','year','email','bio'];//and 
    const valid = up.every((update)=>{
        return allowupdate.includes(update);
     })    
     if(!valid){
        res.status(400);
        return res.send('Invalid updates.')
    }
    //update code
    try{
        // allow to update many times
        up.forEach((update)=>{
         req.user[update]=req.body[update];
        })
        //ensure middleware run correctly 
        await req.user.save();
        res.status(200);
        res.send(req.user);
    }catch(error){
        res.status(400);//bad request
        res.send(error);
    }
})


//only server-side allowed management:

//use to fetch all users information stored in database and show it on body,it return a promise
User.get('/users/all',(req,res)=>{
    UserModel.find({}).then((users)=>{
        res.send(users);
    }).catch((error)=>{
       res.status(500);//bad request
        res.send(error);
    })
})

 //fetch a user by id
 User.get('/search/:id',(req,res)=>{
    const object_id = req.params.id;
    UserModel.findById(object_id).then((user)=>{
       if(!user){
           res.status(404)
           return res.send('404 NOT FOUND');
       }
       res.status(200).send(user);
   }).catch((error)=>{
      res.status(500);//bad request
      res.send(error);
   })
})

//delete user by id
User.delete('/delete/:id',async(req,res)=>{
        const object_id = req.params.id;
        UserModel.findByIdAndDelete(object_id).then((user)=>{
            if(!user){
                res.status(404)
                return res.send('404 NOT FOUND');
            }
            res.status(200).send(user);
        }).catch((error)=>{
           res.status(500);//bad request
           res.send(error);
        })

})

//reference: 
//https://medium.com/mesan-digital/tutorial-3b-how-to-add-password-reset-to-your-node-js-authentication-api-using-sendgrid-ada54c8c0d1f
//https://stackoverflow.com/questions/42682923/password-reset-in-nodejs

//Reset password:

  



//Password RESET
// User.post('/recover', [
//     check('email').isEmail().withMessage('Enter a valid email address'),
// ], validate, Password.recover);

// User.get('/reset/:token', Password.reset);

// User.post('/reset/:token', [
//     check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
//     check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
// ], validate, Password.resetPassword);



// //user recovery
// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'youremail@gmail.com',
//         pass: 'yourpassword'
//     }
// });

// User.get('/recover/:id', (req, res) => {
//     const user_id = req.params.id;
//     const send_email = usermodel.findOne({id: user_id}).email;
//     var recovery_key = 12341; //should be random
//     var mailOptions = {
//     from: 'youremail@gmail.com',
//     to: send_email,
//     subject: 'Test email using nodejs',
//     text: recovery_key
//     };
//     transporter.sendMail(mailOptions, function(error, info){
//        if (error){
//            console.log(error);
//        } 
//        else{
//            console.log('Email sent: '+ info.response);
//        }
//     });
// });


 module.exports = User;
 

