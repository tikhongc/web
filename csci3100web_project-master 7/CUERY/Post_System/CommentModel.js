const CommentSchema = require("./CommentSchema");
require('../mongodb/mongoose');

const CommentModel = mongoose.model("Comment", CommentSchema);

module.exports = CommentModel;
