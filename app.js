const express=require("express")
const cors=require("cors")
const ejs=require("ejs")
const app=express()
require("./config/passport")
require("dotenv").config()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport=require("passport")
const session=require("express-session")
const MongoStore = require('connect-mongo');

require("./config/database")
const User=require("./models/user.model")
app.set("view engine","ejs")
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json());

// session-express
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl:process.env.MONGO_URL,
    collectionName:"sessions"
  })
//====================== cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())


//=======================================  base url

app.get("/",(req,res)=>{
    res.render("index")
})
//=======================================================
const checkLoggedn=(req,res,next)=>{
    if(req.isAuthenticated()){
        return res.redirect("/profile")
    }
    next()
}
app.get("/login",checkLoggedn,(req,res)=>{
    
    res.render("login")   
})

//===========================================================

const chenAuthentication=(req,res,next)=>{
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect("/login")
    }
}





app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login',successRedirect:"/profile"}),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });





app.get("/profile",chenAuthentication,(req,res)=>{
    res.render("profile",{username:req.user.username})
    
})
//========================================================
app.get("/logout",(req,res)=>{
    try {
        req.logout((err)=>{
            if(err){
                return next(err)
            }
            res.redirect("/")
        })
    } catch (error) { 
        res.status(500).send(err.message)
    
    }
})

module.exports=app