

//file for :
//contain methods for schema:
//1.hash password and save
//2.add authentication token
//3.match user by email and password when they log in
//4.hide private data of user
//5.save schema as model and return a user model
//6.create relationship between user and post

const User = require('./UserSchema');
const bcrypt = require('bcryptjs');//https://www.npmjs.com/package/bcrypt
const crypto = require('crypto-js');//https://www.npmjs.com/package/crypto-js
const jwt = require('jsonwebtoken');//https://www.npmjs.com/package/jsonwebtoken

//Adding Virtua-Relationship:

//create a virtual attribute to get full name

//create relationship between user \ post \ comment
// User.virtual('post',{
//     ref:'Post',
//     localFiedl:'_id',
//     foreignField:'poster', //ref stored in Post schema
// })
// User.virtual('comment',{
//   ref:'comment',
//   localFiedl:'_id',
//   foreignField:'commentator', //ref stored in comment schema
// })



//User Methods:

//Find post

//Add an instance method to get the information
User.methods.getInfo = function() {
    return `name: ${this.name} Email: ${this.email} bio: ${this.bio}`;
};

//find user
User.methods.findUser = function() {
    return this.model("User").find({name: this.name}).exec();
};

//function for hide private user data

User.methods.toJSON = function(){
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  //delete userObject.tokens;
  //delete userObject._id;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject.timestamps;
  return userObject;
}

User.methods.Token = async function(){
      const user = this;
       //create token->assign user id , sign token value ->use jsonwebtoken.sign function
      user._id=""+user._id;
      const token = jwt.sign({ _id: user._id},  "" + process.env.JWT_KEY);
      user.tokens = user.tokens.concat({ token });     
       console.log(token);
      await user.save(); //save user
      return token;  //return token

}

User.methods.PasswordReset = function() {
    const user = this;
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};


//reset password


//hash password before saving userinput and call next when we are done
//run some codes do sth before user is saved
User.pre('save',async function(next){
    const user = this;
    //true when user is being updated
    if(user.isModified('password')){
        //ensure the sucrity of user 's password
       user.password = await bcrypt.hash(user.password,8);
    }
    next();
 })


 
//綱要Schemas被mongoose.model()方法“編譯”為模型。擁有模型後，您可以使用它來查找，創建，更新和刪除給定類型的對象。
//model 用來封裝 schema
 const  UserModel= mongoose.model('User', User);

// // Test :connect to database and postman successfully
//   const newuser = new UserModel({
//      name: 'nss123s',
//       email: '1204442@gmail.com  ',
//      password: '123212314',
//     year:3,
//   })
  
//    //save user
//   newuser.save().then(() => {
//        console.log(newuser)
//    }).catch((error) => {
//       console.log(error);
//    })

module.exports = UserModel;
