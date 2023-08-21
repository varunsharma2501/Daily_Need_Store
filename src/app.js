const express= require("express")
const mongoose=require("mongoose")
const hbs=require("hbs")
const routes=require("./routes/routes")
const path=require("path")
const bodyParser=require("body-parser")
const cookieParser=require("cookie-parser")
const flash=require("connect-flash")
const email=require("nodemailer")
const fs=require("fs")
// db connection
mongoose.connect("mongodb://127.0.0.1:27017/DailyNeedStore").then(console.log("connected successfully")).catch(err=>{console.log("mongoz err",err)})
// middle wares
const app=express()
const port=8000
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store');
    next();
  });
app.use(express.static(path.join(__dirname,'..')));
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//models
const category=require("./models/category_models")
const product=require("./models/products_models2")
const user=require("./models/user_model")
const auth=require("./user controller/auth")
//session


// view engine
app.set("view engine","hbs")
app.set("views","views")
hbs.registerPartials("views/partials")
hbs.registerHelper("eq",function(a,b){
    return a===b;
})//
//
// routes
app.use("",routes)


//
// server setup
app.listen(port,()=>{
    console.log(`server is listening in ${port}`);
})
