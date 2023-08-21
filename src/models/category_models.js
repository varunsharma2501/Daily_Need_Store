const mongoose= require("mongoose")
 const schema_cat = mongoose.Schema({
category_type:String,
img:String,
page:String,

 })
 const category= mongoose.model("category",schema_cat)

 module.exports = category;
 