const User=require("../models/user.model")
const passport=require("passport")
require("dotenv").config()
const bcrypt=require("bcrypt")
const LocalStrategy=require("passport-local").Strategy

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
   User.findOne({googleId:profile.id},(err,user)=>{
    if(err) return cb(err,null)
    if(!user){
        let newUser=new User({
            googleId:profile.id,
            username : profile.displayName
        })
        newUser.save()
        return cb(null,newUser)
    }else{
        return cb(null,user)
    }
   })
  }
));


//create session id
// whenever we login it creares user id inside session 
passport.serializeUser((user,done)=>{
    done(null,user.id) 
})

//  find session info using session id
passport.deserializeUser(async(id,done)=>{
    try {
        const user =await User.findById(id)
        done(null,user)
    } catch (error) {
        done(error,false)
    }
})