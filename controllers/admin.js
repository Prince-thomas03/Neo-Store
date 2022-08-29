const userhelpers = require('../helpers/userhelpers')
const adminhelpers = require('../helpers/adminhelpers');
const twlioHelpers = require('../helpers/twlio-helpers');
const categoryHelper = require('../helpers/category-helpers')
const moment = require('moment')


const store = require('multer');
const { response } = require('express');
const { Db } = require('mongodb');



module.exports = {

    getlogin: (req, res, next) => {
        // console.log("reached just here");
        if (req.session.isAdminLoggedin) {
            // 
            res.redirect('/admin/')
        } else {
            console.log("you reached here");
            res.render('admin/admin-login', { layout: 'admin-layout', admin: true })

        }


    },

    postlogin: (req, res, next) => {
        console.log(req.body);
        adminhelpers.dologin(req.body).then((data) => {
            console.log(data);
            if (data.isAdminValid) {
                req.session.isAdminLoggedin = true
                req.session.admin = data.admin
                res.redirect('/admin/')
                console.log('admin');
            } else {
                res.redirect('/admin/login')
                console.log('no admin');
            }

        }).catch((err) => {
            res.redirect('/admin/login')
        })

    },

    adminlogout: (req, res, next) => {
        req.session.isAdminLoggedin = null
        req.session.admin = null
        res.redirect('/admin/login')

    },

    // gethome: async (req, res, next) => {
    //     if (req.session.isAdminLoggedin) {
    //         let admin = req.session.admin

    //         let orders = await adminhelpers.getrecentOrders()
    //         let totalRevenue = await adminhelpers.getRevenue()
    //         let products = await adminhelpers.displayproduct()

    //         console.log("kkkkkkkkkkkkkkkk");

    //         console.log(products);
    //         let activeUsers = await adminhelpers.getActiveUsers()
    //         let orderStatusObj = await adminhelpers.getOrderStatus()
    //         let payMethod = await adminhelpers.getPayMethod()

    //         totalProducts = products.length
    //         // orders.date = orders[0].date.split("",2)
    //         // console.log(orders);
    //         let totalOrders = orders.length
    //         // recentOrders = totalOrders > 5 ? orders.slice( 0, 5 ) : orders

    //         res.render('admin/index', { layout: 'admin-layout', totalRevenue, admin: false, activeUsers, orderStatusObj, payMethod, totalProducts , totalOrders})

    //     } else {
    //         // console.log("redirected to get login");
    //         res.redirect('/admin/login')
    //     }

    // },



    gethome: async (req, res, next) => {

        // console.log("man i reached home");
        if (req.session.isAdminLoggedin) {
            let admin = req.session.admin
            try {


                let delivery = {}
                delivery.pending = 'pending'
                delivery.Placed = 'placed'
                delivery.Shipped = 'shipped'
                delivery.outForDelivery = 'out for Delivery'
                delivery.Deliverd = 'Delivered'
                delivery.Cancelled = 'cancelled'
                const allData = await Promise.all
                    ([
                        adminhelpers.onlinePaymentCount(),
                        adminhelpers.totalUsers(),
                        adminhelpers.totalOrder(),
                        adminhelpers.cancelOrder(),
                        adminhelpers.totalCOD(),
                        adminhelpers.totalDeliveryStatus(delivery.pending),
                        adminhelpers.totalDeliveryStatus(delivery.Placed),
                        adminhelpers.totalDeliveryStatus(delivery.Shipped),
                        adminhelpers.totalDeliveryStatus(delivery.outForDelivery),
                        adminhelpers.totalDeliveryStatus(delivery.Deliverd),
                        adminhelpers.totalDeliveryStatus(delivery.Cancelled),
                        adminhelpers.totalCost(),
                    ]);
                res.render('admin/index', {
                    layout: 'admin-layout', admin: false,

                    OnlinePymentcount: allData[0],
                    totalUser: allData[1],
                    totalOrder: allData[2],
                    cancelOrder: allData[3],
                    totalCod: allData[4],
                    pending: allData[5],
                    Placed: allData[6],
                    Shipped: allData[7],
                    outForDelivery: allData[8],
                    Deliverd: allData[9],
                    Cancelled: allData[10],
                    totalCost: allData[11],
                })

            } catch (err) {
                next(err)
            }

        } else {
            // console.log("redirected to get login");
            res.redirect('/admin/login')
        }

    },









    viewUsers: (req, res, next) => {
        adminhelpers.displayusers().then((users) => {

            res.render('admin/view-users', { layout: "admin-layout", users, usrblock: req.session.userblock })


        })

    },



    viewProducts: (req, res, next) => {
        adminhelpers.displayproduct().then((products) => {

            res.render('admin/view-products', { layout: "admin-layout", products })

        })


    },

    addProducts: (req, res, next) => {
        categoryHelper.displayCategory().then((category) => {

            res.render('admin/add-products', { layout: "admin-layout", category })

        })


    },

    saveproduct: (req, res, next) => {

        let images = []
        console.log(req.files);
        let files = req.files
        console.log("asdfghjkl;asdfghjkl");

        console.log(files);

        images = files.map((value) => {
            return value.filename
        })
        console.log(images);
        //  console.log(req.body);

        adminhelpers.insertdata(req.body, images).then((data) => {

            if (data) {
                res.redirect('/admin/view-products')
            }



        })

    },

    deleteproduct: (req, res, next) => {

        // console.log("entering deletion operation");

        let proId = req.query.id
        // console.log(proId);

        adminhelpers.deleteproduct(proId).then((response) => {

            res.redirect('/admin/view-products')

        })




    },




    editproduct: async (req, res, next) => {

        console.log("re");

        let product = await adminhelpers.getproductdetails(req.params.id)
        console.log(product);
        categoryHelper.displayCategory().then((category) => {

            console.log("this is categoryon display");

            console.log(category);

            res.render('admin/Edit-product', { layout: "admin-layout", product, category })

        })


    },



    updateProduct: (req, res) => {

        // console.log(req.params.id);
        let images = []
        let files = req.files

        images = files.map((value) => {
            return value.filename
        })
        console.log(req.body);

        let proId = req.params.id

        console.log(proId + "  fgsthdyhdy");

        adminhelpers.updateOneProduct(proId, req.body, images).then(() => {

            // console.log("finished update");

            res.redirect('/admin/view-products')


        })


    },




    blockUser: (req, res, next) => {

        console.log("reached userblck state");

        let usrId = req.params.id

        adminhelpers.blockUser(usrId).then((data) => {


            console.log("back to view user page");

            res.redirect('/admin/view-users')



        })



    },


    unblockUser: (req, res, next) => {
        let usrId = req.params.id

        console.log("entering to unblock a user");

        adminhelpers.unblockUser(usrId).then((response) => {

            console.log("ublocked he user");


            res.redirect('/admin/view-users')


        })


    },

    //category section

    addcategories: (req, res, next) => {



        res.render('admin/add-category', { layout: 'admin-layout', error: req.session.categoryError })
        req.session.categoryError = false




    },

    postcategory: async (req, res, next) => {
        // console.log("got into post");

        // console.log(req.body);


        let images = []


        let files = req.files
        // console.log("8525852588");
        console.log(files);
        images = files.map((value) => {
            return value.filename
        })
        // console.log(images);
        //  console.log(req.body);



        categoryHelper.postcategory(req.body).then((response) => {
            console.log(response)
            console.log('================dflkdj')
            if (response.valid) {
                req.session.categoryError = "Category Already Exsist";
                res.redirect('/admin/addcategory')
            } else {
                console.log(req.body);
                console.log('kitty');





                categoryHelper.addCategory(req.body, images).then((respone) => {
                    res.redirect('/admin/view-category')
                })
            }
            // if (response.error) {
            //     req.session.categoryError = true;
            //     res.redirect('/admin/addcategory')
            // } else {

            //     res.redirect('/admin/view-category')
            // }


        })


    },





    viewCategory: (req, res, next) => {

        categoryHelper.displayCategory().then((category) => {

            res.render('admin/view-category', { layout: 'admin-layout', category })

        })


    },

    geteditCategory: async (req, res, next) => {

        let getEdit = await categoryHelper.geteditCategory(req.params.id)

        console.log(getEdit);

        res.render('admin/Edit-category', { layout: 'admin-layout', getEdit })
    },







    editCategory: (req, res, next) => {

        let images = []
        let files = req.files

        images = files.map((value) => {
            return value.filename
        })

        let catId = req.params.id
        categoryHelper.updateCategory(catId, req.body, images).then(() => {

            res.redirect('/admin/view-category')

        })

    },


    deletecategory: (req, res, next) => {
        console.log("enyered the delete fn in controller");

        let catID = req.query.id

        console.log(catID);

        categoryHelper.deletecategory(catID).then((response) => {

            res.redirect('/admin/view-category')


        })


    },

    viewUserOrder: async (req, res, next) => {

        userId = req.params.id
        let userOrders = await userhelpers.userOrderDetails(userId)
        userOrders.forEach(element => {
            element.date = moment(element.date).format("DD-MM-YY , h:mm:ss A")

        });

        res.render('admin/viewUserOrders', { layout: 'admin-layout', userOrders })

    },




    viewUsrOrderproducts: async (req, res, next) => {
        let orderProductDetails = await userhelpers.getOrderProducts(req.params.id)

        orderProductDetails.forEach(element => {
            element.date = moment(element.date).format("DD-MM-YY  -  h:mm:ss A")
        })

        res.render('admin/viewUserOrderProducts', { layout: 'admin-layout', orderProductDetails })



    },


    statusShipped: (req, res, next) => {

        let orderId = req.query.id

        let userId = req.query.userId


        let status = 'shipped'

        adminhelpers.changeStatus(orderId, status).then((response) => {
            console.log("back to change status");

            res.redirect('/admin/viewOrders/' + userId)
        })

    },

    statusDelivered: (req, res, next) => {
        console.log("reached in status shipped");
        let orderId = req.query.id
        let userId = req.query.userId
        let status = 'Delivered'
        adminhelpers.changeStatus(orderId, status).then((response) => {
            res.redirect('/admin/viewOrders/' + userId)
        })
    },



    outForDelivery: (req, res, next) => {
        console.log("reached in status out for delivery");
        let orderId = req.query.id
        let userId = req.query.userId
        let status = 'out for Delivery'
        adminhelpers.changeStatus(orderId, status).then((response) => {
            res.redirect('/admin/viewOrders/' + userId)
        })
    },



    statusCancel: (req, res, next) => {

        let orderId = req.query.id
        let userId = req.query.userId
        let status = 'cancelled'
        adminhelpers.changeStatus(orderId, status).then((response) => {

            res.redirect('/admin/viewOrders/' + userId)



        })


    },


    getAddBaner: (req, res, next) => {


        res.render('admin/addBaner', { layout: 'admin-layout' })



    },



    adddBaner: (req, res, next) => {
        let images = []
        let files = req.files
        images = files.map((value) => {
            return value.filename
        })
        adminhelpers.addBaner(req.body, images).then(() => {

            res.redirect('/admin/view-banner')
        })


    },


    viewBaner: async (req, res, next) => {
        let banners = await adminhelpers.getBaners()
        res.render("admin/viewBaner", { layout: 'admin-layout', banners })
    },


    editBanner: async (req, res, next) => {

        let bannerId = req.params.id
        let banners = await adminhelpers.getBannerDetails(bannerId)
        res.render("admin/editBanners", { layout: 'admin-layout', banners })
    },


    postEditBanners: (req, res, next) => {
        let images = []
        let files = req.files
        images = files.map((value) => {
            return value.filename
        })

        let bannerId = req.params.id

        adminhelpers.postEditBanner(req.body, bannerId, images).then((response) => {
            res.redirect('/admin/view-banner')
        })
    },



    deleteBanner: (req, res, next) => {

        let bannerId = req.params.id
        adminhelpers.deleteBanner(bannerId).then((respone) => {
            res.redirect('/admin/view-banner')

        })

    },

    viewCoupon: async (req, res, next) => {

        let coupons = await adminhelpers.displayCoupons()



        console.log(coupons);

        res.render('admin/viewCoupon', { layout: 'admin-layout', coupons })


    },


    getGenerateCoupon: (req, res, next) => {
        res.render('admin/generateCoupon', { layout: 'admin-layout' })
    },

    postGenerateCoupon: (req, res, next) => {
        adminhelpers.postGenerateCoupon(req.body).then((response) => {

            res.redirect('/admin/viewCoupon')




        })

    },


    deleteCoupon: (req, res, next) => {


        let couponId = req.query.id
        adminhelpers.deleteCoupon(couponId).then((response) => {


            res.redirect("back")
        })


    },


    viewAllOrders: async(req,res,next)=>{
     

 
        let allOrders = await adminhelpers.AllOrders()
        allOrders.forEach(element => {
            element.date = moment(element.date).format("DD-MM-YYYY,h:mm:ss A")
        });
  
        console.log("this is all orders u needed");
  
        console.log(allOrders);
  
        res.render('admin/viewAllOrders',{layout:'admin-layout',allOrders})
  
      },
  

    error: (req, res, next) => {

        res.render('admin/error', { layout: 'admin-layout' })

    },


 


}