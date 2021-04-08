
//file to connect and listen to  server for user

const express = require('express');
const UserRouter = require('./CUERY/User_System/UserController');
const PostRouter = require('./CUERY/Post_System/PostController');
const CommentRouter = require('./CUERY/Post_System/CommentController');
const app = express();
require('./CUERY/mongodb/mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;// nodemon server.js


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('./CUERY/public'));
app.use(express.json())
//registe router
app.use(UserRouter);
app.use(PostRouter);
app.use(CommentRouter);


app.listen(port,()=>{
    console.log('Serve Starting!'+port);
})
