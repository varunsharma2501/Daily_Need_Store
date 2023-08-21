const express = require("express")
const jwt=require("jsonwebtoken")
const{addproductlist,addproduct,addcategory, deletepro,deletecat,ordercheck, userdetail,prodstatus,search,contactus,contact,payment,paymentpost,gmailverification}=require("../../controller/admin")
const routes = express.Router()
const category = require("../models/category_models")
const product = require("../models/products_models2")
const user = require("../models/user_model")
const{invoice}=require("../../controller/invoice_email")
const { auth, un ,auth2,auth3} = require("../user controller/auth")
const { signup, login, logout } = require("../user controller/user_control")
const{getcart,postcart,remove,orderr,orderstatus,profile,cancelorder,prod_page,forget,reset}=require("../../controller/cart")
const { callbackPromise } = require("nodemailer/lib/shared")

//login  and sign up routes
routes.get("/*", un);

routes.get("/login.hbs", (req, res) => {
   
    res.render("login")
})

routes.get("/signup.hbs", (req, res) => {
    res.render("signup")
})


routes.get("/sucessfull.hbs", (req, res) => {
    res.render("sucessfull")
})
routes.get("/api/gmailverification/:token", signup)
routes.post("/login.hbs", login)
routes.get("/logout", un, logout)



// main page 
routes.get("/", async (req, res) => {
    try {  
const cate = await category.find()
   
    res.render("index", {
        cate: cate
    })
    } catch (error) {
        res.send("server error")
    }
    
})
// product page
routes.get("/api/:id",prod_page)

routes.get("/getcart",auth,getcart)
routes.post("/add-to-cart",auth,postcart)
routes.post("/remove",auth,remove)
routes.post('/orders',orderr)
routes.get("/orderstatus",orderstatus)
routes.get("/profile.hbs",profile)
routes.post("/cancelorder",cancelorder) 

routes.get("/admin",auth2,(req,res)=>{
    res.render("admin")
})
routes.get("/addproduct",auth2,addproductlist)
routes.post("/addproducts",auth2,addproduct)
routes.get("/addcategory",auth2,(req,res)=>{
    res.render("addcategory")
})
routes.post("/addcategory",auth2,addcategory)
routes.get("/deletepro",auth2,(req,res)=>{
    res.render("delete")
})
routes.post("/deletepro",auth2,deletepro)
routes.get("/deletecat",auth2,(req,res)=>{
    res.render("delet_category")
})
routes.post("/deletecat",auth2,deletecat)
routes.get("/orderactions",auth2,ordercheck)
routes.post("/orderactions",auth2)
routes.get("/userdetail",auth2,(req,res)=>{
    res.render("userdeatil")
})
routes.post("/userdetail",auth2,userdetail)
routes.post("/status",auth2,prodstatus)
routes.post("/search",search)
routes.post("/invoice",invoice)
routes.get("/forgot",(req,res)=>{
    res.render("forget")
})
routes.post("/forget",forget)
routes.get("/reset/:id/:token",(req,res)=>{
    console.log(req.params.id);
    res.render("forgetpass")
})
routes.post("/reset/:id/:token",reset)
routes.get("/search",search)
routes.get("/contactus",contactus)
routes.post("/contact",contact)
routes.get("/payment",payment)
routes.post("/paymentpost",paymentpost,orderr)
routes.post("/gmailverification",gmailverification)

module.exports = routes;