const fs = require('fs');
const path = require('path');
require('../models/database');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts=(req,res,next)=>{
    let message = req.flash('success');
    if(message.length > 0){
        message = message[0];
    } else{
        message= null;
    }
    Post.find()
    .then(posts=>{
        res.render('index',{
            posts,
            errorMessage:message,
            username: req.session.username,
            isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch(error =>{
        res.status(500).send({ message: error.message || "Error occured"});
    });
    
};
exports.getPost=(req,res,next)=>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else{
        message= null;
    }
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
       
        res.render('view',{
            post,
            errorMessage:message,
            username: req.session.username,
            isAuthenticated: req.session.isLoggedIn
        });
        
    })
    .catch(error =>{
        res.status(500).send({ message: error.message || "Error occured"});
    });
};
exports.searchPost=(req,res,next)=>{
    const searchTerm = req.body.searchTerm;
    Post.find({ $text: { $search:searchTerm , $diacriticSensitive:true} })
    .then(post=>{
        res.render('search',
        {post,
            username: req.session.username,
            isAuthenticated: req.session.isLoggedIn
        });
    })
    .catch(error =>{
        res.status(500).send({ message: error.message || "Error occured"});
    });

};
exports.getcreatePost=(req,res,next)=>{
    res.render('create',{
        isAuthenticated: req.session.isLoggedIn,
        username: req.session.username
        
    });
};
exports.createPost=(req,res,next)=>{
    
    const imageUrl=req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.session.user._id,
        username: req.session.user.name
        
        
    });
    post
    .save()
    .then(result => {
        return User.findById(req.session.user._id);
    })
    .then(user =>{
        creator = user;
        user.posts.push(post);
        return user.save();
        
    })
    .then(result =>{
        
        console.log('created post');
        res.redirect('/');
            
        
    })
    .catch(err =>{
       console.log(err);
    });
   
};
exports.getupdatePost=(req,res,next)=>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else{
        message= null;
    }
    const postId = req.params.postId;

    Post.findById(postId)
    .then(post =>{
        res.render('edit',{
            post:post,
            errorMessage:message,
            username: req.session.username,
            isAuthenticated: req.session.isLoggedIn

        });
    })
    .catch(err => console.log(err))
};
exports.updatePost =(req,res,next)=>{
    const postId = req.params.postId;
    
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){
        imageUrl= req.file.path;
    }
    if(!imageUrl){
        console.log('no file picked');
    }
    Post.findById(postId)
    .then(post =>{
        if(!post){
            console.log('Could not find Post.');
        }
        if(post.creator._id.toString() !== req.session.user._id.toString()){
            req.flash('error','Not authorised');
            return res.redirect('back');
            
        }
        if(imageUrl!== post.imageUrl){
            clearImage(post.imageUrl);
        }
        post.title=title;
        post.imageUrl=imageUrl;
        post.content= content;
        return post.save();
    })
    .then(result =>{
        res.redirect('/');
    })
    .catch(err=>{
        console.log(err);
    });
};
const clearImage = filePath =>{
    filePath = path.join(__dirname, '..',filePath);
    fs.unlink(filePath, err => console.log(err));
};
exports.deletePost =(req,res,next)=>{
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post =>{
        if(!post){
            const error = new Error('Could not find Post.');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator._id.toString() !== req.session.user._id.toString()){
            req.flash('error','Not authorised');
            return res.redirect('back');
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result =>{
        return User.findById(req.session.user._id);
    })
    .then(user =>{
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        
        req.flash('success','Post deleted.');
            return res.redirect('/');
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode= 500;
        }
        next(err);
    });

};