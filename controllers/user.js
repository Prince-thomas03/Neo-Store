const userhelpers = require('../helpers/userhelpers')
const adminhelpers = require('../helpers/adminhelpers');
const twlioHelpers = require('../helpers/twlio-helpers');
const collection = require('../config/collection');
const db = require('../config/connection');
const session = require('express-session');
const { ObjectId } = require('mongodb');

const moment = require('moment')

const uuid = require('uuid');
const categoryHelpers = require('../helpers/category-helpers');

const verifyLogin = ((req, res, next) => {
    if (req.session.isAdminLoggedin) {
        next()
    } else {
        res.redirect('/admin/login')

    }

})

module.exports = {


    gethome: async (req, res, next) => {

        try {
            let category = await categoryHelpers.displayCategory()
            let banners = await adminhelpers.getBaners()

            adminhelpers.displayproduct().then(async (products) => {

                if (req.session.isloggedin) {
                    let user = req.session.user
                    let cartCount = null
                    cartCount = await userhelpers.getCartCount(req.session.user._id)
                    let wishCount = null
                    wishCount = await userhelpers.getWishlistCount(req.session.user._id)
                    let cart = await userhelpers.getCartItems(req.session.user._id)
                    let total = await userhelpers.getTotalAmount(req.session.user._id)
                    let coupon = await adminhelpers.displayCoupons()

                    console.log("this sos coupo");
                    console.log(coupon);


                    res.render('user/index', { user, layout: 'user-layout', products, cartCount, cart, total, wishCount, category, banners, coupon })

                } else {
                    res.render('user/index', { home: true, layout: 'user-layout', products, category, banners })
                    req.session.isloggedin = false

                }


            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    },



    //getlogin
    getlogin: (req, res, next) => {
        try {
            if (req.session.isloggedin) {
                // console.log("reached here to nobackoff");
                res.redirect('/')
            } else {
                // console.log("reached here and login itself");
                res.render('user/user-login', { login: true, layout: 'user-layout', userError: req.session.userError, noUser: req.session.loginerr, userBlock: req.session.blockStatus })
                req.session.userError = false;
                req.session.loginerr = false;
                req.session.blockStatus = false;
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    },


    //postlogin
    postlogin: (req, res, next) => {

        try {
            // let user=db.get().collection(collection.userCollections).find({$or:{email:req.body.email,}})
            userhelpers.dologin(req.body).then((data) => {

                if (data.userBlocked) {

                    req.session.userBlock = data.userBlock
                    req.session.blockStatus = "you are blocked"
                    res.redirect('/login')
                } else {
                    if (data.isUserValid) {

                        //  console.log("loginuser data is valid");
                        req.session.isloggedin = true
                        req.session.user = data.user
                        // console.log("this is what it is");
                        console.log(req.session.user);

                        res.redirect('/')

                    } else {

                        req.session.isloggedin = false
                        req.session.noUser = "invalid username and password"
                        req.session.userError = "password is wrong"


                        // console.log("login user data is not valid");
                        console.log(data);
                        res.redirect('/login')
                    }

                }

            }).catch((err) => {
                req.session.loginerr = "User Doest Exsist"
                res.redirect('/login')
            })


        } catch (error) {

            console.log(error);
            next(error)

        }
    },



    //getsignup
    getsignup: (req, res, next) => {
        try {

            if (req.session.isloggedin) {
                res.redirect('/')

            } else {
                res.render('user/user-signup', { signup: true, layout: 'user-layout', userError: req.session.userError })
            }
        } catch (error) {

            console.log(error);
            next(error)
        }

    },


    //postsignup
    postsignup: async (req, res, next) => {
        try {
            // console.log(req.body);
            // let user=await db.get().collection(collection.userCollections).find({$or : [{email:req.body.email,mobile:req.body.mobile}]}).toArray()
            let user = await db.get().collection(collection.userCollections).findOne({ email: req.body.email })
            // console.log("checking for same user");
            console.log(user);
            if (user) {
                // console.log('same user');
                req.session.userError = "user already exsist"
                res.redirect('/signup')

            } else {
                console.log('no');
                req.session.body = req.body
                twlioHelpers.dosms(req.session.body).then((data) => {
                    console.log(data);
                    if (data) {
                        console.log("enetred sucess");
                        res.redirect('/otp')
                    } else {
                        console.log("entry failed");
                        res.redirect('/signup')

                    }
                })
            }
        } catch (error) {

            console.log(error);
            next(error)
        }
    },

    //getotp
    getotp: (req, res, next) => {
        try {
            if (req.session.isloggedin) {
                res.redirect('/')
            } else {

                res.render('user/otp', { layout: 'user-layout' })

            }

        } catch (error) {

            console.log(error);

            next(error)
        }
    },

    //postotp
    otppost: (req, res, next) => {
        try {
            console.log("first here");
            console.log(req.body);
            twlioHelpers.otpVerify(req.body, req.session.body).then((data) => {

                if (data.valid) {
                    // console.log("otp verification success");

                    userhelpers.dosignup(req.session.body).then((data) => {
                        if (data.isUserValid) {

                            // console.log("userdata valid");

                            req.session.isloggedin = true;
                            req.session.user = data.user
                            res.redirect('/')
                        } else {
                            // console.log("userdata not valid");
                            req.session.isloggedin = false;
                            res.redirect('/signup')
                        }
                    }).catch((err) => {
                        req.session.err = err
                        res.redirect('/signup')

                    })

                }

            })

        } catch (error) {

            console.log(error);
            next(error)

        }
    },

    ///addToCart

    addToCart: (req, res, next) => {

        console.log("2222222222222@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        if (req.session.isloggedin) {
            try {

                let proId = req.params.id

                let userId = req.session.user._id

                userhelpers.addToCart(proId, userId).then(() => {

                    console.log("api call received");

                    res.json({ status: true })

                    // res.redirect('/viewcart')



                })
            } catch (error) {

                console.log(error);

                next(error)

            }

        } else {

            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
            res.redirect('/login')
        }


    },

    //getoneproduct


    //not usercart

    addcart: (req, res, next) => {

        res.redirect('/login')

    },




    getProduct: (req, res, next) => {

        try {
            let proId = req.params.id

            // console.log(proId +"77777777777777777777777777777777");

            userhelpers.getOneProduct(proId).then((product) => {
                // console.log(product +"66666666666666666666666666666666666666666");

                adminhelpers.displayproduct().then(async (products) => {

                    if (req.session.isloggedin) {
                        let user = req.session.user
                        // let cartProducts= await userhelpers.getCartItems(req.session.user._id)
                        cartCount = await userhelpers.getCartCount(req.session.user._id)
                        wishCount = await userhelpers.getWishlistCount(req.session.user._id)


                        let cart = await userhelpers.getCartItems(req.session.user._id)


                        console.log("****************************************");

                        console.log(cart);
console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                        let total = await userhelpers.getTotalAmount(req.session.user._id)

                        res.render('user/products-detail', { user, layout: 'user-layout', product, products, cartCount, wishCount, cart, total })


                    } else {

                        res.render('user/products-detail', { Guest: true, layout: 'user-layout', product, products })

                    }

                    // console.log(products +"11111111111111111111111111111111111111111111");




                })
            })
        } catch (error) {

            console.log(error);

            next(error)

        }

    },

    // viewCart  
    viewCart: async (req, res, next) => {

        try {
            let cartProducts = await userhelpers.getCartItems(req.session.user._id)

            console.log("this is cartproducts");
            console.log(cartProducts);

            let total = 0

            if (cartProducts.length > 0) {

                total = await userhelpers.getTotalAmount(req.session.user._id)

            }
            // console.log(cartProducts);

            let user = req.session.user
            // console.log("iam the user");

            // console.log(user );
            cartCount = await userhelpers.getCartCount(req.session.user._id)



            res.render('user/shoping-cart', { layout: 'user-layout', user, cartProducts, cartCount, total })

        } catch (error) {

            console.log(error);

            next(error)
        }


    },


    //userlogout
    userlogout: (req, res, next) => {
        try {

            req.session.isloggedin = null
            req.session.user = false
            res.redirect('/')
        } catch (error) {

            console.log(error);
            next(error)

        }

    },


    //show products

    showProducts: (req, res, next) => {

        try {
            if (req.session.user) {

                adminhelpers.displayproduct().then(async (products) => {
                    console.log("this is user .sessin.user._id");


                    let user = req.session.user

                    console.log(user);
                    let cartCount = await userhelpers.getCartCount(req.session.user._id)

                    let wishCount = await userhelpers.getWishlistCount(req.session.user._id)
                    let cart = await userhelpers.getCartItems(req.session.user._id)
                    let total = await userhelpers.getTotalAmount(req.session.user._id)
                    res.render('user/products', { layout: 'user-layout', products, wishCount, user, cartCount, cart, total })

                })

            } else {

                adminhelpers.displayproduct().then((products) => {

                    res.render('user/products', { layout: 'user-layout', products, productUser: true })

                })





            }
        } catch (error) {
            console.log(error);
            next(error)

        }

    },
    //changeproduct quantity

    changeProductQuantity: (req, res, next) => {

        try {
            userhelpers.changeProductQuantity(req.body).then(async (response) => {

                response.total = await userhelpers.getTotalAmount(req.body.user)
                res.json(response)


            })

        } catch (error) {

            console.log(error);

            next(error)
        }


    },



    // remove product

    removeProductCart: (req, res, next) => {
        try {

            userhelpers.removeProductCart(req.body).then((response) => {


                res.json(response)

            })
        } catch (error) {

            console.log(error);

            next(error)

        }



    },


    //checkout

    checkout: async (req, res, next) => {

        try {
            let user = req.session.user
            let userId = req.session.user._id
            let total = await userhelpers.getTotalAmount(userId)
            console.log(total);
            let cartCount = await userhelpers.getCartCount(req.session.user._id)

            let savedAddress = await userhelpers.getSavedAddress(userId)

            let coupon = await adminhelpers.displayCoupons()

            console.log("this is coupon");

            console.log(coupon);


            res.render('user/checkout', { layout: 'user-layout', total, cartCount, user, userId, savedAddress, coupon })
        } catch (error) {

            console.log(error);

            next(error)
        }



    },

    //placeorder

    placeorder: async (req, res, next) => {
        try {

            console.log("this is req.body");
            console.log(req.body);

            if (req.body.saveAddress == 'on') {

                await userhelpers.saveAddress(req.body, req.session.user._id)

            }

            let products = await userhelpers.getCartProductDetails(req.body.userId)

            let totalPrice = await userhelpers.getTotalAmount(req.body.userId)
            let discountData = null

            if (req.body.Coupon_Code) {
                await userhelpers.checkCoupon(req.body.Coupon_Code, totalPrice).then((response) => {
                    discountData = response
                }).catch(() => discountData = null)

            }




            userhelpers.placeOrder(req.body, products, totalPrice, discountData).then((orderId) => {


                if (req.body['First_Name'] === '' || req.body['Last_Name'] === '' || req.body['Address'] === '' || req.body['City'] === '' || req.body['State'] === '' || req.body['Post_Code'] === '' || req.body['Phone'] === ''
                    || req.body['Alt_Phone'] === '') {



                    res.json({ online: true })
                } else {

                    if (req.body['Pay_Method'] === 'COD') {
                        res.json({ codSuccess: true })

                        console.log("reached in COd method");


                    }

                    else if (req.body['Pay_Method'] === 'Razorpay') {

                        console.log("reached in Razorpay method");
                        let netAmount = (discountData) ? discountData.amount : totalPrice

                        userhelpers.generateRazorpay(orderId, netAmount).then((response) => {

                            console.log(response);
                            res.json(response)  ///now a order is created and retuing its value to ajax function




                        })
                    }



                    else {
                        res.json({ online: true })
                    }
                }







            })

        } catch (error) {

            console.log(error);

            next(error)

        }



    },

    //orderstatus

    orderStatus: (req, res, next) => {

        try {

            let user = req.session.user

            res.render('user/orderStatus', { layout: 'user-layout', user })

        } catch (error) {
            console.log(error);
            next(error)

        }


    },

    //view orders

    viewOrders: async (req, res, next) => {
        try {

            let orders = await userhelpers.userOrderDetails(req.session.user._id)

            console.log("this is what in viewOrders ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

            console.log(orders);


            orders.forEach(element => {

                element.date = moment(element.date).format("DD-MM-YY - h:mm:ss A")

            });

            let user = req.session.user

            cartCount = await userhelpers.getCartCount(req.session.user._id)


            res.render('user/view-orders', { layout: 'user-layout', user, orders, cartCount })
        } catch (error) {

            console.log(error);

            next(error)
        }



    },

    //view ordered items

    viewOrderProducts: async (req, res, next) => {
        try {

            let user = req.session.user

            let orderId = req.params.id

            console.log(orderId);
            let orderProduct = await userhelpers.getOrderProducts(orderId)

            // let orderDetails= await userhelpers.userOrderDetails(req.session.user._id)

            console.log("this is what in userproductsorderdetails777777777777777777777777777777777777777777777777777777777777777777777777777");

            console.log(orderProduct);


            // console.log("this is what in ordersDetails666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666");
            // console.log(orderDetails);

            res.render('user/vieworderedproducts', { layout: 'user-layout', orderProduct, user })

        } catch (error) {


            console.log(error);

            next(error)

        }



    },


    verifyPayment: (req, res, next) => {
        try {
            console.log("verifypayment");
            console.log(req.body);

            userhelpers.verifyPayment(req.body).then(() => {

                userhelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {

                    res.json({ status: true })

                })



            }).catch((err) => {

                console.log("log the error");
                console.log(err);

                res.json({ status: false })

            })
        } catch (error) {

            console.log(error);

            next(error)
        }


    },


    myProfile: async (req, res, next) => {
        try {

            let user = req.session.user

            cartCount = await userhelpers.getCartCount(req.session.user._id)

            let orders = await userhelpers.userOrderDetails(req.session.user._id)
            console.log(orders);

            let wishCount = await userhelpers.getWishlistCount(req.session.user._id)

            orders.forEach(element => {

                element.date = moment(element.date).format("DD-MM-YY -  h:mm:ss A")

            });

            orderCount = orders.length

            res.render('user/userdashboard', { layout: 'user-layout', user, cartCount, orderCount, orders, wishCount })

        } catch (error) {

            console.log(error);

            next(error)

        }
    },


    editProfile: async (req, res, next) => {


        try {
            let user = req.session.user
            console.log("55555555555555555");

            console.log(user);
            let orders = await userhelpers.userOrderDetails(req.session.user._id)
            cartCount = await userhelpers.getCartCount(req.session.user._id)
            orderCount = orders.length
            let wishCount = await userhelpers.getWishlistCount(req.session.user._id)


            // userDetails=await userhelpers.


            res.render('user/userprofileedit', { layout: 'user-layout', user, cartCount, wishCount, orderCount, orders, edit: true })
        } catch (error) {

            console.log(error);

            next(error)

        }
    },



    cancelOrder: (req, res, next) => {
        try {

            console.log("reached  in cancel oder");

            orderId = req.params.id

            console.log(orderId);



            userhelpers.cancelOrder(orderId).then(() => {

                res.redirect('/vieworders')


            })

        } catch (error) {

            console.log(error);

            next(error)

        }


    },

    wishlist: (req, res, next) => {

        res.redirect('/login')

    },

    addToWhlist: (req, res, next) => {

        try {
            proId = req.params.id

            userId = req.session.user._id

            userhelpers.addToWhlist(proId, userId).then((respose) => {


                res.json({ status: true })



            })
        } catch (error) {
            console.log(error);

            next(error)

        }


    },


    getWishList: async (req, res, next) => {

        try {
            let user = req.session.user

            let products = await userhelpers.getwishlistItems(req.session.user._id)

            console.log("this isuse rwishlist products");

            console.log(products);

            cartCount = await userhelpers.getCartCount(req.session.user._id)

            wishCount = await userhelpers.getWishlistCount(req.session.user._id)


            res.render('user/userWishList', { layout: 'user-layout', products, cartCount, user, wishCount })
        } catch (error) {
            console.log(error);
            next(error)

        }


    },



    removeFromWishList: (req, res, next) => {
        try {
            userhelpers.removeFromWishList(req.body).then((response) => {
                res.json(response)

            })
        } catch (error) {
            console.log(error);
            next(error)

        }

    },




    selectedCategory: async (req, res, next) => {
        try {

            if (req.session.isloggedin) {

                let catname = req.query.id

                let user = req.session.user
                let cartCount = await userhelpers.getCartCount(req.session.user._id)

                let wishCount = await userhelpers.getWishlistCount(req.session.user._id)

                let selectedCategory = await adminhelpers.getSelectedCategory(catname)
                let cart = await userhelpers.getCartItems(req.session.user._id)
                let total = await userhelpers.getTotalAmount(req.session.user._id)

                res.render('user/categorized', { layout: 'user-layout', selectedCategory, cart, total, user, cartCount, wishCount })



            } else {

            }
            let catname = req.query.id

            let selectedCategory = await adminhelpers.getSelectedCategory(catname)

            res.render('user/categorized', { layout: 'user-layout', selectedCategory })
        } catch (error) {
            console.log(error);
            next(error)

        }

    },

    updateProfile: (req, res, next) => {



        try {
            let images = []
            let files = req.files
            images = files.map((value) => {
                return value.filename
            })

            userId = req.session.user._id
            console.log(userId);
            userhelpers.updateProfile(req.body, images, userId).then((response) => {

                res.redirect("/logout")


            })

        } catch (error) {

            next(error)

        }
    },



    getforgetPassword: (req, res, next) => {

        try {
            res.render('user/forgetPassword', { layout: 'user-layout' })
        } catch (error) {

            console.log(error);
            next(error)

        }

    },


    forgetPassword: (req, res, next) => {

        try {
            let userId = req.session.user.Id

            userhelpers.forgetPassword(req.body, userId).then((respose) => {

                res.redirect('/logout')

            })
        } catch (error) {
            console.log(error);
            next(error)
        }


    },

    trackOrder: (req, res, next) => {

        try {
            res.render('user/trackOrder', { layout: 'user-layout' })
        } catch (error) {
            console.log(error);
            next(error)

        }


    },


    postCouponCheck: async (req, res, next) => {
        try {

            let userId = req.session.user._id
            let couponCode = req.body.coupon




            let totalAmount = await userhelpers.getTotalAmount(userId)

            console.log(totalAmount);

            userhelpers.checkCoupon(couponCode, totalAmount).then((response) => {


                res.json(response)
            }).catch((response) => {
                res.json(response)
            })
        } catch (error) {
            console.log(error);
            next(error)

        }
    },



    invoice: async (req, res, next) => {
        try {

            let orderId = req.params.id

            console.log("this is orderId");
            console.log(orderId);
            // let proitem = req.query.pid

            // console.log("this is proitem");
            // console.log(proitem);


            let orders = await userhelpers.getOrderProducts(orderId)

            orders.forEach(element => {
                element.date = moment(element.date).format("DD-MM-YYYY  h:mm:ss A")
            });


            console.log("=======================================================================================");
            console.log(orders);

            res.render('user/invoice', { layout: 'user-layout', orders })

        } catch (error) {
            console.log(error);
            next(error)
        }


    },

    viewaddress: async (req, res, next) => {

        try {
            let userid = req.session.user._id
            let user = req.session.user
            let cartCount = await userhelpers.getCartCount(req.session.user._id)

            let wishCount = await userhelpers.getWishlistCount(req.session.user._id)
            let address = await userhelpers.getSavedAddress(userid)
            res.render('user/viewAddress', { layout: 'user-layout', address, user, cartCount, wishCount })

        } catch (error) {
            console.log(error);
            next(error)

        }
    },

    geteditAddress: async (req, res, next) => {

        try {
            let addressId = req.params.id
            let userAddress = await userhelpers.getUserAddress(addressId)

            console.log("t@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
            console.log(userAddress);

            res.render('user/editAddress', { layout: 'user-layout', userAddress })
        } catch (error) {

            error(error)

        }




    },



    updateAddress: (req, res, next) => {
        try {

            userhelpers.updateUserAddress(req.body).then((respose) => {

                res.redirect("back")

            })
        } catch (error) {
            console.log(error);
            next(error)
        }

    },

    deleteAddress: (req, res, next) => {

        try {

            let deleteId = req.params.id

            userhelpers.deleteAddress(deleteId).then((respose) => {

                res.redirect("back")


            })
        } catch (error) {

            console.log(error);
            next(error)
        }




    }


}