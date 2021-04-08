const {PostSchema} = require("./PostSchema");
require('../mongodb/mongoose');

//Missing: views
const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;
