const jwt = require('jsonwebtoken');//https://www.npmjs.com/package/jsonwebtoken
const usermodel = require('../../User_System/UserModel');

//new request -> dosth ->run router
//function use to limit what api method user can access to
 const authenticationToken = async (req, res, next) => {
    try {
         const token = req.header('Authentication').replace('Tokens ', '');
         //console.log(token);
         const decoded = jwt.verify(token, ""+process.env.JWT_SECRET);
         const user = await usermodel.findOne({ _id: decoded._id, 'tokens.token': token });
         if (!user) { throw new Error(); }
        req.user = user;
        req.token = token;

         next();
     } catch (e) {
         res.status(401);
         res.send({ error: 'Please authenticate.' });
     }
 }

module.exports = authenticationToken;