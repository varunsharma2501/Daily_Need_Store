const mongoose= require("mongoose")

 const schema_cat1 = mongoose.Schema({

product_name:String,
product_price:Number,
category_id:{
type: mongoose.Schema.Types.ObjectId
},
cat_img:String
 

})

 
const product=  mongoose.model("product",schema_cat1)

module.exports=product;