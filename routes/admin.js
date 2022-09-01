var express = require('express');
var router = express.Router();
const admincontroller = require('../controllers/admin');
const { array } = require('../middleware/multer');
const multer = require('../middleware/multer')

//verify login middleware
const verifyLogin = ((req, res, next) => {
    if (req.session.isAdminLoggedin) {
        next()
    } else {
        res.redirect('/admin/login')

    }

})

//Admin Section

router.get('/login', admincontroller.getlogin)

router.get('/', admincontroller.gethome)  // '/admin' call comes to here  first

router.post('/signin', admincontroller.postlogin)

router.get('/view-users', verifyLogin, admincontroller.viewUsers)


// Admin product section
router.get('/view-products', verifyLogin, admincontroller.viewProducts)

router.get('/add-products', verifyLogin, admincontroller.addProducts)

router.post('/saveproduct', store.array('image', 5), admincontroller.saveproduct)

router.get('/delete-product', verifyLogin, admincontroller.deleteproduct)

router.get('/Edit-product/:id', verifyLogin, admincontroller.editproduct)

router.post('/Edit-product/:id', store.array('image', 5), admincontroller.updateProduct)


//user block and unblock
router.get('/blockuser/:id', verifyLogin, admincontroller.blockUser)

router.get('/unblockuser/:id', verifyLogin, admincontroller.unblockUser)

//category section


router.get('/addcategory', verifyLogin, admincontroller.addcategories)

router.post('/postcategory', store.array('image', 1), admincontroller.postcategory)


router.get('/view-category', verifyLogin, admincontroller.viewCategory)


router.get('/editcategory/:id', verifyLogin, admincontroller.geteditCategory)

router.post('/editcategory/:id', store.array('image', 1), admincontroller.editCategory)


router.get('/deletecategory', verifyLogin, admincontroller.deletecategory)



router.get('/logout', admincontroller.adminlogout)


//userManagment


router.get('/viewOrders/:id', verifyLogin, admincontroller.viewUserOrder)

router.get('/viewUserProducts/:id', verifyLogin, admincontroller.viewUsrOrderproducts)

//order managment

router.get('/status-shipped', verifyLogin, admincontroller.statusShipped)


router.get('/status-delivered', verifyLogin, admincontroller.statusDelivered)

router.get('/status-outfordelivery', verifyLogin, admincontroller.outForDelivery)

router.get('/status-cancelled', verifyLogin, admincontroller.statusCancel)

router.get('/allOrders',verifyLogin,admincontroller.viewAllOrders)

//baner Managment

router.get('/view-banner', verifyLogin, admincontroller.viewBaner)

router.get('/getAddBaner', verifyLogin, admincontroller.getAddBaner)

router.post('/addBaner', store.array('image', 3), admincontroller.adddBaner)

router.get('/geteditbanner/:id', verifyLogin, admincontroller.editBanner)

router.post('/editbanners/:id', store.array('image', 3), admincontroller.postEditBanners)

router.get('/deletebanner/:id', verifyLogin, admincontroller.deleteBanner)


//coupon Managment

router.get('/viewCoupon', verifyLogin, admincontroller.viewCoupon)

router.get('/generatecoupon', verifyLogin, admincontroller.getGenerateCoupon)

router.post('/postGenerateCoupon', verifyLogin, admincontroller.postGenerateCoupon)

router.get('/deleteCoupon', verifyLogin, admincontroller.deleteCoupon)

//error

// router.get('/*', verifyLogin, admincontroller.error)

//admin dashboard









module.exports = router;
