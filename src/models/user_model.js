const mongoose = require("mongoose");
const product = require("./products_models2");
const schem = mongoose.Schema({
    name:{ type:String,required:true},
    telephone: { type:Number,required:true},
    email: { type:String,required:true},
    address:{ type:String,required:true},
    Dob:{ type:String,required:true},
    gender:{ type:String,required:true},
    password:{ type:String,required:true},
    role:{type:String,enum:["user","admin"],default:"user"},

    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product'

            },
            productName: {
                type: String
            },
            quantity: { type: Number, required: true },
            subtotal:Number,
          
           
        }],  
       
        total_price: {
            type: Number
        }

    }

})
 
//add -to -card functionality 
schem.methods.addtocart = function (product) {
    let cart = this.cart;
    if (cart.items.length == 0) {
        cart.items.push({ productId: product._id, productName: product.product_name, quantity: 1,subtotal:product.product_price})
       
        cart.total_price = product.product_price;
        
    }else {
        const isExisting=this.cart.items.findIndex(orderItem=>orderItem.productId.toString() === product._id.toString())
        if (isExisting==-1) {
        cart.items.push({ productId: product._id, productName: product.product_name, quantity: 1,subtotal:product.product_price })
      
        cart.total_price += product.product_price;
       
        } else {
          const qty_change=this.cart.items[isExisting] ;

          qty_change.quantity+= 1;
         qty_change.subtotal=qty_change.quantity*product.product_price;
          cart.total_price += product.product_price; 
        } 
    

    } 

  
 return this.save();

}













const user = mongoose.model("user", schem)
module.exports = user;