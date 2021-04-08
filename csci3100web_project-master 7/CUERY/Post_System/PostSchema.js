
const mongoose = require("mongoose");

const statusList = ["available", "hidden", "draft"]

const categoryList = ["query", "idea", "activity", "project", "rant"];

const topicList = ["anthropology", "english studies", "fine arts",
"history", "language and linguistics", "music", "philosophy",
"religious studies", "business and finance", "education",
"engineering", "computer science", "electronic engineering",
"data science", "biomedical engineering", "laws", "medicine and pharmacy", 
"nursing", "chinese medicine", "public health", "science", 
"mathematics", "social science", "economics", "urban studies",
"psychology", "journalism and communication", "data science"];

const PostSchema = mongoose.Schema(
    {
        owner:{
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            max: 256,
            min: 1
        },
        content: {
            type: String,
            required: true,
            max: 4096,
            min: 1
        },
        category: {
            type: String,
            lowercase: true,
            required: true,
            enum: categoryList
        },
        topic: {
            type: String,
            lowercase: true,
            required: true,
            enum: topicList
        },
        status: {
            type: String,
            lowercase: true,
            enum: statusList,
            default: "available"
        },
        upvotes: {
            type: Number, 
            default: 0
        },
        upvoteOwners: {
            type: [String],
            default: []
        },
        downvotes: {
            type: Number,
            default: 0
        },
        downvoteOwners: {
            type: [String],
            default: []
        },
        votes: {
            type: Number,
            default: 0
        },
        comments: { //may be removed since it its not necessary?
            type: [String],
            default: []
        },
        controversy: {
            type: Number,
            default: 0
        }
}, {
    timestamps: true
});

PostSchema.pre('save', async function(next) {
  //this is the controversial schema, needs reworking!!
    const post = this;
    if(post.isModified('upvotes') || post.isModified('downvotes')) {
        //Calculating controversy points
        if(Math.max(post.upvotes, post.downvotes) !== 0) {
            post.controversy = (Math.min(post.upvotes, post.downvotes) / Math.max(post.upvotes, post.downvotes)) * (post.upvotes + post.downvotes);
        }
        else {
            post.controversy = 0;
        }
        
        //Calculating the total votes
        post.votes = post.upvotes - post.downvotes;
    }
    next();
});

module.exports = {
    statusList: statusList,
    categoryList: categoryList,
    topicList: topicList,
    PostSchema: PostSchema
}