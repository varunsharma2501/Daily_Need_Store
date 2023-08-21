const product=require("../src/models/products_models2")
const category=require("../src/models/category_models")
const async = require("hbs/lib/async")
const order=require("../src/models/order")
const jwt=require("jsonwebtoken")
const user=require("../src/models/user_model")
const emails=require("nodemailer")
const stripe = require('stripe')('sk_test_51MzNxFSCJCJH1qapBAwbXIaEd7RosU5p7wyaT5Pikh2dg9yCoTliAIgU7s85t4b0z6QwMnX2XvwZx8iaFkajJE9k00LEnwAOiH');



//  adding caterory in add product
const addproductlist=async(req,res)=>{
    const productlist= await category.find({})
    res.render("addproduct",{
        productlist:productlist
    })

}
// posting add products
const addproduct= async(req,res)=>{
  try {
     const{productname,productprice,imagelink,categoryname}=req.body;
    
     
   const newproduct = new product({
    product_name:productname,
    product_price:productprice,
    cat_img:imagelink,
    category_type:categoryname
   }) 

   const save=await newproduct.save();
   if (save) {
    err="Product Successfully Added"
    res.render("admin",{err})
   } else {
    res.send("server error")
   }
  } catch (error) {
    console.log("trycatch");
  } 
}
// add category
const addcategory= async(req,res)=>{
    try {
       const{category_name,category_img}=req.body;
      
       
     const newproduct = new category({
     category_type:category_name,
      img:category_img
      
     }) 
  
     const save=await newproduct.save();
     if (save) {
      err="Category Successfully Added"
      res.render("admin",{err})
     } else {
      res.send("server error")
     }
    } catch (error) {
      console.log("trycatch");
    } 
  }
  // delet product
  const deletepro=async(req,res)=>{
   
   try {
     const{category_id}=req.body;
    console.log(category_id);
    const del = await  product.findOneAndDelete({_id:category_id})
     


    if (del) {
        err="Product Removed"
        res.render("admin",{err})
       } else {
        res.send("server error")
       }
   } catch (error) {
    console.log("error",error);
   }
  }
  //delete catergory
  const deletecat=async(req,res)=>{
   
    try {
      const{category_id}=req.body;
     console.log(category_id);
     const del = await  category.findOneAndDelete({_id:category_id})
 
     if (del) {
         err="Category Removed"
         res.render("admin",{err})
        } else {
         res.send("server error")
        }
    } catch (error) {
     console.log("error",error);
    }
   }
   //ordercheck
   const ordercheck=async (req,res)=>{
     const orderchecks= await order.find({status:"Pending"})
     if (orderchecks) {
    
       res.render("adminordercheck",{orderchecks:orderchecks})
     } else {
      res.send("unable to fetch order list")
     }
   }
   //customer info
  const userdetail=async (req,res)=>{
    const{customer_info}=req.body;
   
    const userprofile= await user.findById({_id:customer_info})

    if (userprofile) {
    
      res.render("userprofilea",{userprofile:userprofile})
      
    } else {
     res.send("cannot get user info")
    }

  }
// status 
const prodstatus=async (req,res)=>{
  const {status}=req.body;
  console.log(status);
const stat= await order.findByIdAndUpdate(status,{status:"Delivered"})
if (stat) {
  res.redirect("/orderactions")
  
}
else{
  res.send("cannot delivered")
}
}
//search 
const search=async(req,res)=>{
  const token = req.cookies.jwt;
  if (token) {
     const decode = jwt.verify(token, "akshya bal")
  const usert = decode.id;
  const users=await user.findOne({_id:usert})
const{search}=req.body;
const query= new RegExp(search,'i')
const rp= await product.find({product_name:query})
if (rp.length > 0) {
  const search=true
  res.render("product_page",{products:rp,user:users,search})
} else {
  res.send(`<h1>NO PRODUCT FOUND RELATED TO ${search}</h1>`)
}
  } else {
    const{search}=req.body;
const query= new RegExp(search,'i')
const rp= await product.find({product_name:query})
if (rp.length > 0) {
  const search=true
  res.render("product_page",{products:rp,search})
} else {
  res.send(`<h1>NO PRODUCT FOUND RELATED TO ${search}</h1>`)
}
  } }

//contact
const contactus=(req,res)=>{
  res.render("CONTACTUS")
}
//
const contact=async(req,res)=>{
  try {
      const{name,email,subject,message}=req.body
      const token = req.cookies.jwt;
      const decode = jwt.verify(token, "akshya bal")
      const usert = decode.id;
      const userprofile = await user.findById({ _id: usert })
      const username=userprofile.name
      const transport =await  emails.createTransport({
        service: "gmail",
        auth: {
          user: "dailyneedstore144601@gmail.com",
          pass: "dtweotannnqecyfd"
        }
      })
  
      const mailOptions = {
        from:email,
        to: "dailyneedstore144601@gmail.com",
        subject: "Customer Request",
        html:`<h4>Customer Name : ${username} <h4>Customer Email:${userprofile.email}<h4>Subject:${subject}</h4>${message}`
  
  
      }
  
       await transport.sendMail(mailOptions, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send("Failed to send email");
         
        } else {
         console.log("request is successfully sent to your Email"); 
         res.render("CONTACTUS",{error:"We got Your request"})
         }})
  } catch (error) {
    
  }
 
}
 const payment=async(req,res,next)=>{
  let token=req.cookies.jwt;
  const decode = jwt.verify(token, "akshya bal")
  const user_id = decode.id;
  const userName=await user.findById({_id:user_id})
  if (userName.cart.items.length === 0) {
    let mssge = true;
    res.redirect(`/getcart?msge=${mssge}`)
  } 
  else{
  res.render("payment",{userinfo:userName})    


  }
 }

const paymentpost=async(req,res,next)=>{

// const{cardname,cardnumber,expire,cvv}=req.body;
// const [exp_month, exp_year] = expire.split('/');


//   const token = await stripe.tokens.create({
//     card: {
//       number: cardnumber,
//         exp_month: exp_month,
//         exp_year: exp_year,
//         name: cardname,
//         cvc: cvv

//     }
//   });

//   // Charge the customer using the Stripe API
//   const charge = await stripe.charges.create({
//     amount: 10*100,
//     currency: "USD",
//     source: token.id
//   });
next();






}


const gmailverification=async (req,res,next)=>{
  try {
   const{name,telephone,Dob,gender,email,password,address}=req.body;
  
   const token = jwt.sign({ name: name,telephone:telephone,Dob:Dob,gender:gender,email:email,password:password,address:address }, "secret_key", { expiresIn: '10m' })
      
   const link = `http://localhost:8000/api/gmailverification/${token}`
 
       const transporter = emails.createTransport({
         service: "gmail",
         auth: {
           user: "dailyneedstore144601@gmail.com",
           pass: "dtweotannnqecyfd"
         },
       });
 
       const mailOptions = {
         from: "dailyneedstore144601@gmail.com",
         to: email,
         subject: "Gmail Verification",
         html: `Please click <a href="${link}">here</a> to verify your Gmail.`,
       };
       try {
         const info = await transporter.sendMail(mailOptions);
         const error = "Verification  Link is send to yor Email "
         try {
           const cate = await category.find()
 
           res.render("index", {
             cate: cate, error
           })
         } catch (error) {
           res.send("server error1")
         }
 
       } catch (error) {
         console.log(error);
       }
  } catch (error) {
       console.log(error);
  }
 }







 module.exports={addproductlist,addproduct,addcategory,deletepro,paymentpost,deletecat,ordercheck,userdetail,prodstatus,search,contactus,contact,payment,gmailverification}

