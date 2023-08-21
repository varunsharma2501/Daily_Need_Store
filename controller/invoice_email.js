const email = require("nodemailer")
const fs = require("fs")
const path = require("path")
const product = require("../src/models/products_models2")
const jwt = require("jsonwebtoken")
const user = require("../src/models/user_model")
const order = require("../src/models/order")

const category = require("../src/models/category_models")



const invoice = async (req, res) => {
  try { const token = req.cookies.jwt;
    const decode = jwt.verify(token, "akshya bal")
    const usert = decode.id;
    const userprofile = await user.findById({ _id: usert })
    const orderhistory = await order.find({ user: userprofile })
    // invoice
    const { invoice } = req.body;
    const orderdetail = await order.findById({ _id: invoice })
    const items = orderdetail.items.map(item => 
    `<li>${item.productName}</li>`).join('')
    const quantity = orderdetail.items.map(item => 
   ` <li>${item.quantity}</li> `).join('')
    const subtotal = orderdetail.items.map(item => 
    `<li>${item.subtotal} </li>`).join('')
      
   
  
    const customer = await user.findById({ _id: orderdetail.user })
   
    
    const htmls = `<html>
    <head>
      <meta charset="utf-8" />
      <title>A simple, clean, and responsive HTML invoice template</title>
  
      <style>
        .invoice-box {
          max-width: 800px;
          margin: auto;
          padding: 30px;
          border: 1px solid #eee;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
          font-size: 16px;
          line-height: 24px;
          font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
          color: #555;
        }
  
        .invoice-box table {
          width: 100%;
          line-height: inherit;
          text-align: left;
        }
  
        .invoice-box table td {
          padding: 5px;
          vertical-align: top;
        }
  
        
  
        .invoice-box table tr.top table td {
          padding-bottom: 20px;
        }
  
        .invoice-box table tr.top table td.title {
          font-size: 45px;
          line-height: 45px;
          color: #333;
        }
  
        .invoice-box table tr.information table td {
          padding-bottom: 40px;
        }
  
        .invoice-box table tr.heading td {
          background: #eee;
          border-bottom: 1px solid #ddd;
          font-weight: bold;
        }
  
        .invoice-box table tr.details td {
          padding-bottom: 20px;
        }
  
        .invoice-box table tr.item td {
          border-bottom: 1px solid #eee;
        }
  
        .invoice-box table tr.item.last td {
          border-bottom: none;
        }
  
        .invoice-box table tr.total td:nth-child(2) {
          border-top: 2px solid #eee;
          font-weight: bold;
        }
  
        @media only screen and (max-width: 600px) {
          .invoice-box table tr.top table td {
            width: 100%;
            display: block;
            text-align: center;
          }
  
          .invoice-box table tr.information table td {
            width: 100%;
            display: block;
            text-align: center;
          }
        }
  
        /** RTL **/
        .invoice-box.rtl {
          direction: rtl;
          font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        }
  
        .invoice-box.rtl table {
          text-align: right;
        }
  
        .invoice-box.rtl table tr td:nth-child(2) {
          text-align: left;
        }
      </style>
    </head>
  
    <body>
      <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
          
          <tr class="top">
            <td colspan="2">
              <table>
                <tr>
                  <td>
                    <h1>Invoice </h1><br />
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
  
          <tr class="information">
            <td colspan="2">
              
              <table>
                <tr>
                  
                  <td>billed to:<br/>
                    ${customer.name}<br />
                    ${customer.email}<br />
                    ${customer.telephone}<br/>
                    ${customer.address}
  
                  </td>
  
                  
                </tr>
              </table>
            </td>
          </tr>
  
          <tr class="heading">
            <td>Payment Method</td>
  
            <td>Order id </td>
          </tr>
  
          <tr class="details">
            <td>Cash on Deliver</td>
  
            <td>${orderdetail._id}</td>
  
          <tr class="heading">
            <td>Item</td>
            <td>Quantity</td>
            <td>Price</td>
          </tr>
          
  
          <tbody class="item">
            <td>${items}</td>
            <td>${quantity}</td>
            <td>${subtotal}</td>
          </tbody>
  
          

          <tr class="item last">
            <td>GST</td>
            <td></td>
            <td>0.00</td>
          </tr>
          <br><BR>
          <tr class="total">
            <td>Total:</td>
            <td></td>
            <td>Rs.${orderdetail.total_price}</td>
          </tr>
        </table>
      </div>
    </body>
  </html>`



    const transport = email.createTransport({
      service: "gmail",
      auth: {
        user: "dailyneedstore144601@gmail.com",
        pass: "dtweotannnqecyfd"
      }
    })

    const mailOptions = {
      from: "dailyneedstore144601@gmail.com",
      to: userprofile.email,
      subject: "Invoice",
      html: htmls


    }

    transport.sendMail(mailOptions, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Failed to send email");
      } else {
         const msg="Order invoice is successfully sent to your Email"
        res.render("userprofilea",{
          userprofile: userprofile, orderhistory: orderhistory,msg
        })

      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send invoice");

  }
}

module.exports = { invoice };