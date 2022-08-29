var express = require('express');
var router = express.Router();
const usercontroller=require('../controllers/user')
const uuid=require('uuid')
const { array } = require('../middleware/multer');
const multer = require('../middleware/multer')


//verify login middleware
const verifyLogin=((req,res,next)=>{
if(req.session.isloggedin){
    next()
}else{
    res.redirect('/login')
}

})





// /* GET home page. */
router.get('/',usercontroller.gethome);


// /* GET login page.*/

router.get('/login',usercontroller.getlogin);


// /* post login page.*/
router.post('/login',usercontroller.postlogin)


// /* get signup page.*/
router.get('/signup',usercontroller.getsignup)


// /* post signup page.*/
router.post('/signup',usercontroller.postsignup)


// /* logout.*/
router.get('/logout',usercontroller.userlogout)


// /* Get Otp.*/
router.get('/otp',usercontroller.getotp)


// /* Post Otp.*/
router.post('/otppost',usercontroller.otppost)


// //view cart
router.get('/viewcart',verifyLogin,usercontroller.viewCart)


//show producs
router.get('/showproducts',verifyLogin,usercontroller.showProducts)







// //Add to cart

router.get('/addToCart/:id',usercontroller.addToCart)


//product details

router.get('/getProduct/:id',usercontroller.getProduct)

//cahnge product quantitiy

router.post('/change-product-quantity',verifyLogin,usercontroller. changeProductQuantity)



//REOMOVE PRODUCT FROM CART

router.post('/removeProductFromCart',verifyLogin,usercontroller.removeProductCart)


//checkout

router.get('/checkout',verifyLogin,usercontroller.checkout)


//placeorder

router.post('/placeorder',verifyLogin,usercontroller.placeorder)

//orderStatus

router.get('/orderstatus',verifyLogin,usercontroller.orderStatus)

// //view orders

router.get('/vieworders',verifyLogin,usercontroller.viewOrders)



//view order items

router.get('/viewOrderProducts/:id',verifyLogin,usercontroller.viewOrderProducts)

//verify payment

router.post('/verifyPayment',usercontroller.verifyPayment)

//my profile

router.get('/myprofile',verifyLogin,usercontroller.myProfile)

//my editprofile

router.get('/editprofile',verifyLogin,usercontroller.editProfile)

router.post('/updateProfile',store.array('image', 2),usercontroller.updateProfile)

//cancel order

router.get('/cancelOrder/:id',verifyLogin,usercontroller.cancelOrder)

//wishlist 
router.get('/addtowishlist/:id',verifyLogin,usercontroller.addToWhlist,usercontroller.removeProductCart)

//getwishlist

router.get('/getwishlist',verifyLogin,usercontroller.getWishList)

//removeFromWishList

router.post('/removeFromWishList',usercontroller.removeFromWishList)

//Error Page


// router.get('/getcategoryWomen',usercontroller.getWomen)


router.get('/getselectedcategory',usercontroller.selectedCategory)

//Forget Password

router.get('/forgetPassword',usercontroller.getforgetPassword)
router.post('/forgetPassword',verifyLogin,usercontroller.forgetPassword)


//trackOrder

router.get('/trackorder',verifyLogin,usercontroller.trackOrder)


//coupon

router.post('/check-coupon', verifyLogin, usercontroller.postCouponCheck)

//seacrh

// router.get('/search',usercontroller.search)


//invoice

router.get('/invoice/:id',verifyLogin,usercontroller.invoice)

//view-addrress

router.get('/viewaddress',verifyLogin,usercontroller.viewaddress)

//Edit Address

router.get('/editaddress',verifyLogin,usercontroller.editAddress)




module.exports = router;
