const { send } = require('@sendgrid/mail');
const express = require('express');
const CommentModel = require("./CommentModel");
const PostModel = require("./PostModel");
const router = new express.Router();
require('../mongodb/mongoose');
const authentication=require('../User_System/method/authentication');
const { post } = require('../User_System/UserSchema');

//Missing: login authentication

/**
 * The user can:
 * 1. Retrieve a comment
 * 2. Retrieve all children comments by a parent ID
 * 3. Create a comment
 * 4. Modify a comment of its content
 * 5. Cast a vote only once or cancel a vote
 * 6. Delete a comment
 */

//1. Retrieve a comment
router.get('/comments/:id', authentication, async (req, res) => {
    try {
        const comment = await CommentModel.findById(req.params.id);
        if(!comment) {
            return res.status(404).send();
        }
        res.send(comment);
    } catch(error) {
        res.status(500).send();
    }
});

//2. Retrieve all children comments by a parent ID
router.get('/comments/children/:id', authentication, async (req, res) => {
    try {
        const parentPost = await PostModel.findById(req.params.id);
        if(parentPost) {
            const comments = await CommentModel.find({ parentComment: "", parentPost: req.params.id });
            return res.send(comments);
        }
        else {
            const parentComment = await CommentModel.findById(req.params.id);
            if(parentComment) {
                const comments = await CommentModel.find({ parentComment: req.params.id });
                return res.send(comments);
            }
        }
        return res.status(404).send({ error: "No parent object found." });
    } catch(error) {
         res.status(500).send(error);
    }
});

//3. Create a comment
router.post('/comments', authentication, async (req, res) => {
    const newComment = new CommentModel(req.body);


    try {
        const parentPost = await PostModel.findById(newComment.parentPost);
        if(!parentPost) {
            return res.status(404).send({ error: "No parent post found!" });
        }
        if(!newComment.parentComment) {
            await parentPost.update({ $addToSet: { comments: newComment.id }});
        }
        else {
            //pushing the comment id to the parentComment
            const parentComment = await CommentModel.findByIdAndUpdate(newComment.parentComment, { $addToSet: { childrenComments: newComment.id }});
            if(!parentComment) {
                return res.status(404).send({ error: "No parent comment found!" });
            }
        }
        //saving the comment
        await newComment.save();
        return res.status(201).send(newComment);
    } catch(error) {
        return res.status(400).send(error);
    }
});

//4. Modify a comment of its content
router.patch('/comments/:id', authentication, async (req, res) => {
    //Validating legitimacy of the update requests
    updates = Object.keys(req.body);
    allowedUpdates = ["content"];
    isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if(!isValidOperation) {
        return res.status(400).send({ error: "Invalid update." });
    }

    try {
        const comment = await CommentModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidator: true });
        if(!comment) {
            return res.status(404).send();
        }
        res.send(comment);
    } catch(error) {
        res.status(500).send(error);
    }
});

//5. Cast a vote only once or cancel a vote
//The request body must use a vote object
/**
 *   An example vote object:
 *   {
 *       "owner": "username",
 *       "action": "upvote" (this can be "upvote", "downvote", or "cancel")
 *   }
 */
 router.patch('/comments/vote/:id', authentication, async (req, res) => {
    const {owner, action} = req.body;

    try {
        //checking if the comment exists
        const comment = await CommentModel.findById(req.params.id);
        if(!comment) {
            return res.status(404).send();
        }
        //cancelling a vote
        if(action === "cancel") {
            if(comment.upvoteOwners.includes(owner) || comment.downvoteOwners.includes(owner)) {
                //checking if the voter has an upvote or not
                const isUpvote = comment.upvoteOwners.includes(owner);
                if(isUpvote) {
                    try {
                        comment.upvoteOwners.splice(comment.upvoteOwners.indexOf(owner), 1);
                        comment.upvotes -= 1;
                        await comment.save();
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send();
                    } 
                }
                else {
                    try {
                        comment.downvoteOwners.splice(comment.upvoteOwners.indexOf(owner), 1);
                        comment.downvotes -= 1;
                        await comment.save();
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send();
                    } 
                }
            }
            return res.status(404).send({ error: "No owner found." });
        }
        //voting
        else if(action === "upvote" || action === "downvote") {
            //checking if the owner has already voted
            const alreadyVoted = comment.upvoteOwners.includes(owner) || comment.downvoteOwners.includes(owner);

            if(alreadyVoted) {
                //warning the client that the owner has already voted
                return res.status(400).send({error: "The owner has already casted a vote. Cancel the vote first."});
            }
            else {
                //handling an upvote
                if(action === "upvote") {
                    try {
                        comment.upvoteOwners.push(owner);
                        comment.upvotes += 1;
                        await comment.save();
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send(error);
                    }
                }
                //handling a downvote
                else {
                    try{
                        comment.downvoteOwners.push(owner);
                        comment.downvotes += 1;
                        await comment.save();
                        return res.send(req.body);
                    } catch(error) {
                        return res.status(500).send(error);
                    }
                }
            }
        }
        else return res.status(400).send({error: "Invalid action. (Use cancel, upvote, or downvote)"});
    } catch(error) {
        return res.status(500).send(error);
    }
});

//6. Delete a comment
router.delete('/comments/:id', authentication, async (req, res) => {
    try {
        const comment = await CommentModel.findById(req.params.id);
        if(!comment) {
            return res.status(404).send();
        }
        try {
            await comment.update({ deleted: true },  {new: true});
            return res.send(comment);
        } catch(error) {
            return res.status(500).send(error);
        }
    } catch(error) {
        return res.status(500).send(error);
    }
});

module.exports = router;