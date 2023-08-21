const product = require("../src/models/products_models2")
const jwt = require("jsonwebtoken")
const user = require("../src/models/user_model")
const order = require("../src/models/order")
const category = require("../src/models/category_models")
const nodemailer = require("nodemailer")
const async = require("hbs/lib/async")
const bcrypt = require("bcrypt")
const secret = "akshya"

const prod_page = async (req, res) => {
  try {
    let catId = req.params.id;
    const categories = await category.findOne({ _id: catId })
    const products = await product.find({ category_id: catId })
    res.render("product_page", {
      products,
      name: categories.category_type,
      added: req.query.added
    })

  } catch (error) {
    res.send("PROBlEM IN GETTIMG PRODUCTS")
  }
}

const getcart = async (req, res) => {
  //getting user id from jwt  
  const token = req.cookies.jwt;
  const decode = jwt.verify(token, "akshya bal")
  const usert = decode.id;
  try {
    // Find the user in the database and populate their cart with product details
    const users = await user.findById(usert).populate('cart.items.productId').exec();
    
    // Render the cart view with the user's cart data
    res.render('add-to-cart', {
      products: users.cart.items,
      total: users.cart,
      empty:req.query.msge

    });
  } catch (err) {

    res.status(500).send('Error retrieving user cart');
  }

}



//post cart api
const postcart = async (req, res, next) => {
  try {
    const { product_id } = req.body;

    const token = req.cookies.jwt;
    const decode = jwt.verify(token, "akshya bal")
    const usert = decode.id;
    const users = await user.findById({ _id: usert })
    req.user = users;
    const product_info = await product.findById({ _id: product_id })
    req.user.addtocart(product_info)
      .then(async result => {
        //finding category id from product id so the redirect using param
        const produc_info = await product.findById({ _id: product_id })
        const catid = produc_info.category_id;
        res.redirect(`/api/${catid}?added=true`)


      })

  }
  catch (error) {
    console.log("error");
  }

}


const remove = async (req, res) => {
  //getting user id
  const token = req.cookies.jwt;
  const decode = jwt.verify(token, "akshya bal")
  const usert = decode.id;

  try {
    //getting product id
    const productId = req.body.proid;
    const productt = productId


    // Find the user by ID
    const User = await user.findById(usert);


    if (!User) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Find the index of the product in the cart items

    const index = User.cart.items.findIndex(item => item.productId.toString() === productt);

    if (index === -1) {
      return res.status(404).send({ error: 'Product not found in cart' });
    }

    // Get the product price and quantity to update the total price
    const { subtotal, quantity } = User.cart.items[index];

    // Remove the product from the cart items array
    User.cart.items.splice(index, 1);

    // Update the total price of the cart
    User.cart.total_price -= subtotal;

    // Save the updated user object
    await User.save();

    res.status(204).redirect("/getcart");
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal server error' });
  }
};


// order 

const orderr = async (req, res) => {
  const token = req.cookies.jwt;
  const decode = jwt.verify(token, "akshya bal")
  const usert = decode.id;


  try {
    // find the user by ID
    const User = await user.findById(usert);

    if (!User) {
      return res.status(404).json({ error: 'User not found' });
    }
   
      // create a new order document using the user's cart data
      const Order = new order({
        user: usert,
        items: User.cart.items,
        total_price: User.cart.total_price
      });

      // save the order to the database
      const savedOrder = await Order.save();
      const orderid = savedOrder._id;
      // clear the user's cart
      User.cart.items = [];
      User.cart.total_price = 0;
      const result = await User.save();



      return res.redirect(`/orderstatus?id=${orderid}`)
      // return the saved order as a response
    


  } catch (error) {

    return res.status(500).json({ error: 'Error saving order' });
  }
};


const orderstatus = async (req, res) => {
  try {
    const tt = req.query.id;

    if (tt) {

      res.render("order detair", { tt })

    } else {
      console.log("error");
    }
  } catch (error) {

  }
}
//profile
const profile = async (req, res) => {
  const token = req.cookies.jwt;
  const decode = jwt.verify(token, "akshya bal")
  const usert = decode.id;
  const userprofile = await user.findById({ _id: usert })
  if (userprofile) {
    const orderhistory = await order.find({ user: userprofile })


    res.render("userprofilea", {
      userprofile: userprofile, orderhistory: orderhistory,
    })
  } else {



    res.status(404)
  }

}
// cancel order
const cancelorder = async (req, res) => {
  const { cancelorder } = req.body;

  const tt = await order.deleteOne({ _id: cancelorder })
  if (tt) {
    const token = req.cookies.jwt;
    const decode = jwt.verify(token, "akshya bal")
    const usert = decode.id;
    const userprofile = await user.findById({ _id: usert })
    if (userprofile) {
      const orderhistory = await order.find({ user: userprofile })

      const err = "Order Sccessfully Cancelled";
      res.render("userprofilea", {
        userprofile: userprofile, orderhistory: orderhistory, err
      })

    } else {
      res.send("Database Error")
    }

  }

}

const forget = async (req, res,next) => {
  const { email } = req.body;
  try {
    const userchck = await user.findOne({ email: email })
    if (userchck) {
      const user_secret = secret + userchck.password;

      const token = jwt.sign({ email: userchck.email, id: userchck._id }, user_secret, { expiresIn: '10m' })
      const link = `http://localhost:8000/reset/${userchck.id}/${token}`

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "dailyneedstore144601@gmail.com",
          pass: "dtweotannnqecyfd"
        },
      });

      const mailOptions = {
        from: "dailyneedstore144601@gmail.com",
        to: userchck.email,
        subject: "Password reset request",
        html: `Please click <a href="${link}">here</a> to reset your password.`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        const error = "Password Reset Link is send to yor Email "
        try {
          const cate = await category.find()

          res.render("index", {
            cate: cate, error
          })
        } catch (error) {
          res.send("server error")
        }

      } catch (error) {
        console.log(error);
      }


    } else {
      res.send("<h1>USER NOT FOUND!! PLEASE ENTER CORRECT EMAIL</h1>")
    }

  } catch (error) {
    res.send("server  error")
  }

}

//
const reset = async (req, res) => {
  const userid = req.params.id;
  const usertoken = req.params.token;
  const { pass1, pass2 } = req.body
  console.log(pass1);
  try {
    const chckuser = await user.findById({ _id: userid })
    if (chckuser) {
      console.log(chckuser.password);
      const SECRET = secret + chckuser.password;
      try {
        const decode = jwt.verify(usertoken, SECRET)

        if (pass1 === pass2) {
          const hashedpass = await bcrypt.hash(pass1, 10);
          chckuser.password = hashedpass;

          await chckuser.save();
          const err = true;
          res.render("sucessfull", { err })

        } else {
          res.send("password should me same")
        }
      } catch (error) {
        res.send("token doesn't match")
      }

    } else {
      res.send("USER NOT FOUND")
    }
  } catch (error) {
    res.send("sever error")
  }


}
module.exports = { prod_page, getcart, postcart, remove, orderr, orderstatus, profile, cancelorder, forget, reset }