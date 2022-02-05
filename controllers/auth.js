require('../models/database');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
exports.getsignup=(req,res,next)=>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else{
        message= null;
    }
    res.render('signup',{
        errorMessage: message,
        username: req.session.username,
        isAuthenticated: req.session.isLoggedIn
    });
};
exports.getlogin=(req,res,next)=>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0];
    } else{
        message= null;
    }
    res.render('login',{
        errorMessage: message,
        username: req.session.username,
        isAuthenticated: req.session.isLoggedIn
    });
};
var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
exports.postsignup =(req,res,next)=>{
    const name=req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
     
    User.findOne({ email: email})
    .then(userDoc =>{
        if(userDoc){
           req.flash('error','Email already exist.');
           return res.redirect('/signup');
        }
        return bcrypt.hash( password, 12)
        .then (hashedPw =>{
            const user = new User({
                email:email,
                password: hashedPw,
                name:name
    
            });
            return user.save();
        })

           
            
            .then(result =>{
                res.redirect('/login');
            })
        })
        
        
    
        
    .catch(err =>{
        console.log(err);
    });
};
exports.postlogin =(req,res,next)=>{
    const email =req.body.email;
  const password = req.body.password;
  var validemail = emailregex.test(email);
      
    User.findOne({email: email})
    .then(user =>{
        if(!user){
            req.flash('error','Invalid email or password');
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password)
        .then(doMatch =>{
            if(doMatch){
                req.session.isLoggedIn =true;
                req.session.user = user;
                req.session.username = user.name;
                
                return req.session.save(err =>{
                    console.log(err);
                    res.redirect('/');
                });
                
            }
            
            res.redirect('/login');
        })
        
    })
    
    .catch(err =>{
        console.log(err);
        res.redirect('/login');
    });
};
exports.postlogout = (req,res,next)=>{
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/');
    });

};