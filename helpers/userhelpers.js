const db = require('../config/connection')
const collection = require('../config//collection')
const bcrypt = require('bcrypt');
// const { ObjectId } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const { response } = require('express');
const Razorpay = require('razorpay');
const { log } = require('console');
const { resolve } = require('path');
const instance = new Razorpay({
    key_id: 'rzp_test_FLrqXJHKvw0YdP',
    key_secret: 'YxWAOjrCBU5nZ5oe8wa6EBJ4',
});
const { v4: uuidv4 } = require('uuid');


module.exports = {
    dosignup: (userdata) => {
        console.log(userdata);

        return new Promise(async (resolve, reject) => {
            const userinfo = {}
            userdata.password = await bcrypt.hash(userdata.password, 10);
            userdata.c_password = await bcrypt.hash(userdata.c_password, 10);
            db.get().collection(collection.userCollections).insertOne(userdata).then((data) => {
                if (data) {
                    console.log("reached data");
                    userinfo.isUserValid = true;
                    userinfo.user = userdata
                    resolve(userinfo)
                } else {
                    console.log("reached datafailed");
                    userinfo.isUserValid = false;
                    resolve(userinfo)
                }

            }).catch((err) => {
                reject(err)
            })



        })

    },


    dologin: (userdata) => {
        return new Promise(async (resolve, reject) => {
            const userinfo = {};
            const user = await db.get().collection(collection.userCollections).findOne({ email: userdata.email })

            console.log(user);



            if (user) {
                // console.log(user);
                let userStatus = user.blockUser

                userinfo.emailExist = true
                bcrypt.compare(userdata.password, user.password).then((data) => {
                    if (data) {
                        if (userStatus) {
                            userinfo.isUserValid = false;
                            userinfo.passwordExist = false
                            userinfo.userBlocked = true
                            resolve(userinfo)

                        } else {

                            console.log(data);
                            // console.log("data verified corrctly");
                            userinfo.passwordExist = true
                            userinfo.isUserValid = true;
                            userinfo.user = user;
                            resolve(userinfo)

                        }

                    } else {
                        // console.log(' data is wrong login failed passwordd');
                        userinfo.isUserValid = false;
                        userinfo.passwordExist = false

                        resolve(userinfo)

                    }
                })
            } else {
                // console.log('login failed');
                userinfo.isUserValid = "user doest Exsist"
                userinfo.emailExist = false
                userinfo.passwordExist = false
                reject(userinfo)
            }

        }).catch((err) => {

            reject(err)
        })
    },



    //add-to-cart
    addToCart: (proId, userId) => {

        console.log(proId);

        console.log(userId)

        let proObj = {
            item: ObjectId(proId),
            quantity: 1
        }

        // console.log("got into addtocart");
        return new Promise(async (resolve, reject) => {

            // console.log("got into addtocart promise");

            let userCart = await db.get().collection(collection.userCart).findOne({ user: ObjectId(userId) })

            if (userCart) {

                console.log("got into cart");

                let proExsist = userCart.products.findIndex(product => product.item == proId)

                if (proExsist != -1) {
                    db.get().collection(collection.userCart).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(proId) }, {

                        $inc: { 'products.$.quantity': 1 }


                    }

                    ).then(() => {

                        resolve()

                    })

                } else {

                    db.get().collection(collection.userCart).updateOne({ user: ObjectId(userId) }, {
                        $push: { products: proObj }
                    }).then((response) => {

                        resolve()
                    })
                }

            } else {
                console.log("got into addtocart db insertion");
                let cartobj = {
                    user: ObjectId(userId),
                    products: [proObj]
                }

                db.get().collection(collection.userCart).insertOne(cartobj).then((response) => {

                    resolve(response)

                    // console.log("finished db operation pf cart");

                })

            }
        })

    },

    //get one product details

    getOneProduct: (proId) => {

        // console.log(proId +"333223332332323");

        // console.log("got into get one product");

        return new Promise((resolve, reject) => {

            db.get().collection(collection.productCollection).findOne({ _id: ObjectId(proId) }).then((response) => {

                resolve(response)

                // console.log(response +"555555555555555555555555555555555555555555555");




            })




        })



    },


    //getCartItems

    getCartItems: (userId) => {

        // console.log("reached here in get cart items");

        return new Promise(async (resolve, reject) => {

            let cartItems = await db.get().collection(collection.userCart).aggregate([

                {



                    $match: { user: ObjectId(userId) }

                },
                {

                    $unwind: '$products'


                }, {


                    $project: {

                        item: '$products.item',
                        quantity: '$products.quantity'


                    }
                },
                {

                    $lookup: {

                        from: collection.productCollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }



                }, {

                    $project: {

                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }


                },
                {

                    $addFields: { sum: { $multiply: ['$quantity', '$product.price'] } }


                }





            ]).toArray()




            // if(cartItems.length == 0){
            //     resolve(cartItems)
            // }else{
            //     resolve(cartItems)
            // }

            // console.log(cartItems.product.[0]name);
            // console.log(cartItems);

            resolve(cartItems)


        })


    },


    //getcartcount

    getCartCount: (userId) => {

        return new Promise(async (resolve, reject) => {

            let count = 0

            let user = await db.get().collection(collection.userCart).findOne({ user: ObjectId(userId) })

            if (user) {

                count = user.products.length

            }

            resolve(count)




        })

    },




    changeProductQuantity: (details) => {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.userCart)
                    .updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { products: { item: ObjectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.userCart)
                    .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },






    removeProductCart: (details) => {

        let productId = details.productId
        let cartId = details.cartId
        return new Promise((resolve, reject) => {
            db.get().collection(collection.userCart).updateOne({ _id: ObjectId(cartId) },
                {
                    $pull: { products: { item: ObjectId(productId) } }
                }
            ).then((response) => {
                resolve({ productRemoved: true })
            })
        })

    },



    getTotalAmount: (userId) => {

        console.log("this is user id");
        console.log(userId);



        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.userCart).aggregate([

                {



                    $match: { user: ObjectId(userId) }

                },
                {

                    $unwind: '$products'


                }, {


                    $project: {

                        item: '$products.item',
                        quantity: '$products.quantity'


                    }
                },
                {

                    $lookup: {

                        from: collection.productCollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'

                    }



                }, {

                    $project: {

                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }


                },
                {

                    $group: {

                        _id: null,

                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }


                    }

                }






            ]).toArray()

            if (total.length == 0) {
                console.log("this is what in  total.lenfth==0");
                resolve(total)
            } else {

                console.log("thid is what in total[0].total");
                resolve(total[0].total)

            }


        })



    },



    placeOrder: async (order, products, total, discountData) => {

        console.log("this is discount data");

        console.log(discountData);

        // let orderData = {
        //     Total_Amount: total,
        //     discountData: discountData

        // }


        let netAmount = discountData ? discountData.amount : total
        let discount = discountData ? discountData.discount : null




        let invoice = parseInt(Math.random() * 9999)





        let status = order['Pay_Method'] === 'COD' ? 'placed' : 'pending'

        let orderObj = {


            deliveryDetails: {

                First_Name: order.First_Name,
                Last_Name: order.Last_Name,
                Company_Name: order.Company_Name,
                Street_Address: order.Street_Address,
                Extra_Details: order.Extra_Details,
                Town_City: order.Town_City,
                Country_State: order.Country_State,
                Post_Code: order.Post_Code,
                Phone: order.Phone,
                Alt_Phone: order.Alt_Phone,
                Coupon_Code: order.Coupon_Code,
                UsdToInr: order.UsdToInr,

            },

            userId: ObjectId(order.userId),
            PaymentMethod: order['Pay_Method'],

            products: products,
            totalAmount: total,
            discountAmt: discount,
            paidAmount: netAmount,
            invoiceNumber: invoice,
            status: status,
            date: new Date()
        }
        return new Promise((resolve, reject) => {

            db.get().collection(collection.orderCollection).insertOne(orderObj).then((response) => {

                // db.get().collection(collection.userCart).deleteOne({ user: ObjectId(order.userId) })

                resolve(response.insertedId)


            })


        })





    },


    getCartProductDetails: (userid) => {


        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection(collection.userCart).findOne({ user: ObjectId(userid) })

            resolve(cart.products)

        })




    },



    userOrderDetails: (userId) => {


        return new Promise(async (resolve, reject) => {



            let userOrder = await db.get().collection(collection.orderCollection).find({ userId: ObjectId(userId) }).toArray()



            resolve(userOrder)



        })


    },





    getOrderProducts: (orderId) => {


        console.log(orderId);

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.orderCollection).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        invoiceNumber: 1,
                        paidAmount: 1,
                        discountAmt: 1,
                        totalAmount: 1,
                        orderData: 1,
                        item: '$products.item',
                        quantity: '$products.quantity',
                        deliveryDetails: 1,
                        status: 1,
                        date: 1,
                        PaymentMethod: 1
                    }

                },
                {
                    $lookup: {
                        from: collection.productCollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        invoiceNumber: 1,
                        paidAmount: 1,
                        discountAmt: 1,
                        totalAmount: 1,
                        orderData: 1,
                        PaymentMethod: 1,
                        date: 1,
                        status: 1,
                        deliveryDetails: 1,
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve(orderItems)


        }


        )
    },




    generateRazorpay: (orderId, netAmount) => {

        return new Promise((resolve, reject) => {

            var options = {

                amount: netAmount * 100,
                currency: 'INR',
                receipt: "" + orderId


            };


            instance.orders.create(options, function (err, order) {

                if (err) {

                } else {



                    resolve(order)


                }



            })




        })



    },


    verifyPayment: (data) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'YxWAOjrCBU5nZ5oe8wa6EBJ4');

            hmac.update(data['payment[razorpay_order_id]'] + '|' + data['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == data['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }

        })
    },


    changePaymentStatus: (orderId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.orderCollection).updateOne({ _id: ObjectId(orderId) },

                {

                    $set: {

                        status: 'placed',
                        placed: 'true'

                    }

                }
            ).then(() => {

                resolve()


            })


        })


    },


    cancelOrder: (orderId) => {


        return new Promise((resolve, reject) => {

            db.get().collection(collection.orderCollection).updateOne({ _id: ObjectId(orderId) },

                {

                    $set: {
                        status: "cancelled",

                        cancel: true

                    }

                }

            ).then(() => {

                resolve()

            })






        })

    },


    saveAddress: (address, userId) => {

        let addressData = {

            addressId: uuidv4(),
            First_Name: address.First_Name,
            Last_Name: address.Last_Name,
            Company_Name: address.Company_Name,
            Street_Address: address.Street_Address,
            Extra_Details: address.Extra_Details,
            Town_City: address.Town_City,
            Country_State: address.Country_State,
            Post_Code: address.Post_Code,
            Phone: address.Phone,
            Alt_Phone: address.Alt_Phone

        }


        return new Promise(async (resolve, reject) => {
            let getAddress = await db.get().collection(collection.addressCollection).findOne({ user: ObjectId(userId) })
            console.log("this is GETADDRESS");
            console.log(getAddress);
            if (getAddress) {
                db.get().collection(collection.addressCollection).updateOne({ user: ObjectId(userId) },
                    {
                        $push: {
                            address: addressData
                        }
                    }).then((response) => {
                        resolve(response)
                    })

            } else {
                let addressObj = {
                    user: ObjectId(userId),
                    address: [addressData]
                }

                db.get().collection(collection.addressCollection).insertOne(addressObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },

    getSavedAddress: (userId) => {
        console.log(userId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.addressCollection).findOne({ user: ObjectId(userId) }).then((savedAddress) => {
                if (savedAddress) {
                    let addressArray = savedAddress.address
                    if (addressArray.length > 0) {
                        resolve(savedAddress)
                        console.log('its there');
                    } else {
                        resolve(false)
                        console.log('its false');
                    }
                } else {
                    resolve(false)
                    console.log('no address at all');
                }
            })
        })


    },


    addToWhlist: (proId, userId) => {
        proObj = {
            item: ObjectId(proId)
        }
        return new Promise(async (resolve, reject) => {
            wishListExsist = await db.get().collection(collection.userWishList).findOne({ user: ObjectId(userId) })
            if (wishListExsist) {
                let proExsist = await wishListExsist.products.findIndex(check => check.item == proId)
                if (proExsist != -1) {
                    db.get().collection(collection.userWishList).updateOne({ user: ObjectId(userId) },

                        {

                            $pull: { products: proObj }

                        }).then((response) => {

                            resolve(response)
                        })

                } else {

                    db.get().collection(collection.userWishList).updateOne({ user: ObjectId(userId) },
                        {

                            $push: { products: proObj }


                        }).then((response) => {

                            resolve(response)

                        })

                }

            } else {
                let wishObj = {

                    user: ObjectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.userWishList).insertOne(wishObj).then((response) => {
                    resolve(response)
                })

            }
        })

    },


    getwishlistItems: (userId) => {
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            wishlistItems = await db.get().collection(collection.userWishList).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item'
                    }
                },
                {
                    $lookup: {
                        from: collection.productCollection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            resolve(wishlistItems)
            // console.log(wishlistItems);

        })
    },



    getWishlistCount: (userId) => {
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let count = 0
            let wishlist = await db.get().collection(collection.userWishList).findOne({ user: ObjectId(userId) })

            if (wishlist) {
                count = wishlist.products.length
            } else {
                count = 0
            }
            resolve(count)
        })
    },


    removeFromWishList: (details) => {

        let productId = details.productId
        let wishId = details.wishId
        return new Promise((resolve, reject) => {
            db.get().collection(collection.userWishList).updateOne({ _id: ObjectId(wishId) },
                {
                    $pull: { products: { item: ObjectId(productId) } }
                }
            ).then((response) => {
                resolve({ productRemoved: true })
            })
        })

    },

    updateProfile: async (userData, image, userId) => {

        console.log("reached update profile in helpers");

        userData.password = await bcrypt.hash(userData.password, 10);
        userData.c_password = await bcrypt.hash(userData.c_password, 10);

        return new Promise((resolve, reject) => {

            db.get().collection(collection.userCollections).updateOne({ _id: ObjectId(userId) }, {
                $set: {

                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    c_password: userData.c_password,
                    mobile: userData.mobile,
                    image: image






                }
            }).then((response) => {


                resolve(response)
            })

        })



    },



    checkCoupon: (code, amount) => {
        const coupon = code.toString().toUpperCase();

        console.log(coupon);

        return new Promise((resolve, reject) => {
            db.get().collection(collection.couponCollection).findOne({ name: coupon }).then((response) => {
                console.log(response);
                console.log('from db');
                if (response == null) {
                    // let response = {status : false}
                    console.log(response + "          null resp");
                    reject({ status: false })
                } else {
                    let offerPrice = parseInt(amount * response.offer / 100)
                    // let discountPrice = amount - offerPrice
                    let newTotal = parseInt(amount - offerPrice)
                    // response = {
                    //     amount: newTotal,
                    //     discount: discountPrice
                    // }
                    console.log("          Nonnull resp");
                    resolve(response = {
                        couponCode: coupon,
                        status: true,
                        amount: newTotal,
                        discount: offerPrice
                    })
                    console.log('tttttttttttttttt');
                    console.log(response);
                }
            }).catch((error) => {
                reject(error)
            })
        })
    },


    getSavedAddress: (userid) => {


        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.addressCollection).findOne({ user: ObjectId(userid) }).then((address) => {

                console.log("this is colseo address");

                console.log(address);

            if(address){
                let userAddress=address.address
                 
                resolve(userAddress)
            }else{
                resolve(false)
            }

       })

           
        })


    }




}





