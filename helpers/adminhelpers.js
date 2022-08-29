const db = require('../config/connection')
const collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { response } = require('express')
// const { Collection } = require('mongodb')
const objectId = require('mongodb').ObjectId
// const admin = require('../controllers/admin')


module.exports = {

  //Admin Login

  dologin: (adminData) => {

    return new Promise(async (resolve, reject) => {
      const admininfo = {}
      const admin = await db.get().collection(collection.adminCollection).findOne({ email: adminData.email })

      // admininfo.isAdminValid=false;

      if (admin) {
        console.log('user exists');
        if (admin.password === adminData.password) {
          admininfo.isAdminValid = true
          admininfo.admin = admin
          resolve(admininfo)
          // console.log('password');

        } else {
          admininfo.isAdminValid = false
          resolve(admininfo)
          // console.log('no password');
        }

      } else {
        // console.log('no user');
        admininfo.isAdminValid = false
        resolve(admininfo)
      }

    })

  },



  //Datainsertion 

  insertdata: (productdata, images) => {
    // console.log(productdata);

    productdata.price = parseInt(productdata.price)

    return new Promise((resolve, reject) => {

      db.get().collection(collection.productCollection).insertOne({

        name: productdata.name,
        price: productdata.price,
        brand: productdata.brand,
        description: productdata.description,
        category: productdata.category,
        'deletedproduct': false,
        images: images
      }).then((data) => {

        resolve(data)

      }).catch((err) => {
        reject(err)
      })

    })

  },


  //Displayproduct

  displayproduct: () => {

    return new Promise(async (resolve, reject) => {

      let product = await db.get().collection(collection.productCollection).find({ deletedproduct: false }).toArray()

      resolve(product)
      //    console.log("is what");
      // console.log(product);

    })

  },


  //Display Users

  displayusers: () => {

    return new Promise(async (resolve, reject) => {

      let users = await db.get().collection(collection.userCollections).find().toArray()
      resolve(users)

    })
  },


  //Delete product

  deleteproduct: (proId) => {

    // console.log(proId);

    return new Promise((resolve, reject) => {

      db.get().collection(collection.productCollection).updateOne({ _id: objectId(proId) }, {
        $set: {
          deletedproduct: true
        }
      }).then((response) => {

        console.log(response);

        resolve(response)

      })
    })

  },


  //Get product details

  getproductdetails: (proId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.productCollection).findOne({ _id: objectId(proId) }).then((product) => {

        resolve(product)
      })

    })

  },


  //Update the product

  updateOneProduct: (proId, proDetails, images) => {


    // console.log(proDetails);
    // console.log("got to updateone function");

    return new Promise((resolve, reject) => {


      db.get().collection(collection.productCollection).updateOne({ _id: objectId(proId) },
        {
          $set: {
            name: proDetails.name,
            price: proDetails.price,
            brand: proDetails.brand,
            description: proDetails.description,
            category: proDetails.category,
            images: images
          }
        }).then(() => {

          // console.log("rsopse of the update one function"+response);
          resolve()
        })

    })
  },


  //BlockUsers


  blockUser: (usrId) => {
    console.log("reached usrblck of adminhelpers");

    return new Promise((resolve, reject) => {

      db.get().collection(collection.userCollections).updateOne({ _id: objectId(usrId) }, { $set: { blockUser: true } }).then((response) => {
        console.log("user has been blocked in databse");
        resolve(response)
      })

    })

  },


  //Unblock Users

  unblockUser: (proId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.userCollections).updateOne({ _id: objectId(proId) }, { $set: { blockUser: false } }).then((response) => {


        console.log(response);

        console.log("ublock field updated as false in userdatabase");

        resolve(response)

      })

    })

  },



  changeStatus: (orderId, status) => {
    console.log("reached in chnge status to shiiped");
    // return new Promise((resolve, reject) => {
    //     db.get().collection(collection.orderCollection).updateOne({ _id: objectId(orderId) },
    //         {

    //             $set: {
    //                 status: status
    //             }

    //         }

    //     ).then((response) => {
    //         resolve(response)
    //     })

    // })

    return new Promise(async (resolve, reject) => {
      try {

        //shipped
        if (status === 'shipped') {
          let statusUpdate = await db.get().collection(collection.orderCollection).updateOne({ _id: objectId(orderId) },
            {
              $set: {
                status: status,
                shipped: true,
                cancelled: false,
                delivered: false,
                outForDelivery: false,
                placed: false

              }
            }
          )
          if (statusUpdate) {
            resolve(statusUpdate)
          }
        }

        //pending
        else if (status === 'out for Delivery') {
          let statusUpdate = await db.get().collection(collection.orderCollection).updateOne({ _id: objectId(orderId) },
            {
              $set: {
                status: status,
                //   pending:true,
                delivered: false,
                outForDelivery: true,
                shipped: false,
                cancelled: false,
                placed: false



              }
            }
          )
          if (statusUpdate) {
            resolve(statusUpdate)
          }
        }

        //out_for_delivery
        else if (status === 'Delivered') {
          let statusUpdate = await db.get().collection(collection.orderCollection).updateOne({ _id: objectId(orderId) },
            {
              $set: {
                status: status,

                cancelled: false,
                shipped: false,
                outForDelivery: false,
                delivered: true,
                placed: false


              }
            }
          )
          if (statusUpdate) {
            resolve(statusUpdate)
          }
        }



        //cancelled
        else if (status === 'cancelled') {
          let statusUpdate = await db.get().collection(collection.orderCollection).updateOne({ _id: objectId(orderId) },
            {
              $set: {
                status: status,
                cancelled: true,
                shipped: false,
                out_for_delivery: false,
                delivered: false,


              }
            }
          )
          if (statusUpdate) {
            resolve(statusUpdate)
          }
        }

      } catch (error) {
        console.log(error);
      }
    })

  },


  getSelectedCategory: (catname) => {

    console.log("]]]]]]]]]]]]]]]]]]]]]]]]]]]]]");

    console.log(catname + "66966");

    return new Promise(async (resolve, reject) => {

      let selectedCat = await db.get().collection(collection.productCollection).find({ category: catname, deletedproduct: false }).toArray()


      console.log(selectedCat);
      resolve(selectedCat)

    })



  },


  addBaner: (data, images) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.BanerCollection).insertOne({ name: data.name, image: images, delete: false }).then((respone) => {


        resolve(respone)
      })


    })

  },


  getBaners: () => {

    return new Promise(async (resolve, reject) => {

      let banners = await db.get().collection(collection.BanerCollection).find({ delete: false }).toArray()



      console.log(banners);

      resolve(banners)

    })


  },



  getBannerDetails: (bannerId) => {

    return new Promise(async (resolve, reject) => {


      let bannerDetails = await db.get().collection(collection.BanerCollection).findOne({ _id: objectId(bannerId) })


      resolve(bannerDetails)

    })


  },


  postEditBanner: (details, bannerId, images) => {

   

    return new Promise((resolve, reject) => {

      db.get().collection(collection.BanerCollection).updateOne({ _id: objectId(bannerId) }, {

        $set: {

          name: details.name,
          image: images
        }


      }).then((respone) => {


        console.log(response);

        resolve(respone)
      })



    })

  },


  deleteBanner: (bannerId) => {

    console.log("99999999999999999999999999999999");

    return new Promise((resolve, reject) => {

      db.get().collection(collection.BanerCollection).updateOne({ _id: objectId(bannerId) }, {

        $set: { delete: true }
      }).then((response) => {

        resolve(response)

      })



    })


  },




  postGenerateCoupon: (couponData) => {

    const oneDay = 1000 * 60 * 60 * 24

    let couponObj = {
      name: couponData.name.toUpperCase(),
      offer: parseFloat(couponData.offer),
      validity: new Date(new Date().getTime() + (oneDay * parseInt(couponData.validity)))

    }


    return new Promise((resolve, reject) => {

      db.get().collection(collection.couponCollection).find().toArray().then((result) => {
        if (result[0] == null) {
          db.get().collection(collection.couponCollection).createIndex({ "name": 1 }, { unique: true })
          db.get().collection(collection.couponCollection).createIndex({ "validity": 1 }, { expireAfterSeconds: 0 })
          db.get().collection(collection.couponCollection).insertOne(couponObj).then((response) => {
            resolve(response)
          })
        } else {
          db.get().collection(collection.couponCollection).insertOne(couponObj).then((response) => {
            resolve(response)
          })
        }

      })

    })

  },


  displayCoupons: () => {
    return new Promise((resolve, reject) => {
      let coupons = db.get().collection(collection.couponCollection).find().toArray()
      resolve(coupons)
    })
  },

  deleteCoupon: (couponId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.couponCollection).deleteOne({ _id: objectId(couponId) }).then((response) => {

        console.log("finished db operation");
        resolve(response)
      })
    })

  },





  // getrecentOrders: () => {
  //     return new Promise(async (resolve, reject) => {
  //         let orders = await db.get().collection(collection.orderCollection).find().toArray()
  //         resolve(orders.reverse())
  //     })
  // },



  // getRevenue: () => {
  //     return new Promise(async (resolve, reject) => {
  //         let deliveredRevenue = await db.get().collection(collection.orderCollection).aggregate([

  //             {
  //                 $match: { "status": "Delivered" }
  //             },

  //             {
  //                 $group: {
  //                     _id: null,
  //                     total: { $sum: '$orderData.Total_Amount' }
  //                 }
  //             }

  //         ]).toArray()

  //         deliveredRevenue = deliveredRevenue[0] ? deliveredRevenue[0].total : 0

  //         let discountRevenue = await db.get().collection(collection.orderCollection).aggregate([
  //             {
  //                 $match: { "status": "Delivered" }
  //             },

  //             {
  //                 $group: {
  //                     _id: null,
  //                     total: { $sum: "$orderData.discountData.discount" }
  //                 }
  //             }
  //         ]).toArray()
  //         discountRevenue = discountRevenue[0] ? discountRevenue[0].total : 0

  //         let totalRevenue = deliveredRevenue - discountRevenue

  //         resolve(totalRevenue)
  //     })
  // },


  // getActiveUsers: () => {
  //     return new Promise(async (resolve, reject) => {
  //         let users = await db.get().collection(collection.userCollections).count({ block: false })
  //         resolve(users)
  //         console.log("99999999999999999999999999999999999999");
  //         console.log(users);
  //     })
  // },


  // getOrderStatus: () => {

  //     return new Promise(async (resolve, reject) => {
  //         let delivered = await db.get().collection(collection.orderCollection).count({ status: "Delivered" })
  //         let packed = await db.get().collection(collection.orderCollection).count({ status: "Packed" })
  //         let shipped = await db.get().collection(collection.orderCollection).count({ status: "shipped" })
  //         let cancelled = await db.get().collection(collection.orderCollection).count({ status: "Cancelled" })

  //         statusData = {
  //             delivered: delivered,
  //             packed: packed,
  //             shipped: shipped,
  //             cancelled: cancelled,
  //         }
  //         resolve(statusData)
  //     })
  // },


  // getPayMethod: () => {
  //     return new Promise(async (resolve, reject) => {
  //         let cod = await db.get().collection(collection.orderCollection).count({ Pay_Method: "COD" })
  //         let razorPay = await db.get().collection(collection.orderCollection).count({ Pay_Method: "Razorpay" })

  //         let payData = {
  //             cod: cod,
  //             razorPay: razorPay
  //         }

  //         resolve(payData)
  //     })
  // },


onlinePaymentCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.orderCollection).find({ PaymentMethod: "Razorpay" }).count()
        resolve(count)
console.log("this is on;ine payment count");

console.log(count);

      } catch (err) {
        reject(err)
      }

    })
  },

  totalUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.userCollections).find().count()
        resolve(count)
console.log("this is tottal users count");

console.log(count);

      } catch (err) {
        reject(err)
      }
    })
  },
  totalOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.orderCollection).find().count()
        resolve(count)
console.log("this is total orders count");
console.log(count);

      } catch (err) {
        reject(err)
      }
    })
  },

  cancelOrder: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.orderCollection).aggregate([
          {
            $match: {
              status: "cancelled"
            }
          },

      {
            $count: 'number'
          }

        ]).toArray()
        resolve(count)

console.log("this is total cancel orders");
console.log(count);

      } catch (err) {
        reject(err)
      }

    })
  },
  totalCOD: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = await db.get().collection(collection.orderCollection).find({ PaymentMethod: "COD", }).count()
        resolve(count)

        console.log("this is total totalCOD");
console.log(count);

      } catch (err) {
        reject(err)
      }
    })
  },


  totalDeliveryStatus: (data) => {

    console.log("this sis data");
    console.log(data);

    return new Promise(async (resolve, reject) => {
      try {
        let statusCount = await db.get().collection(collection.orderCollection).aggregate([
          {
            $match: {
              status: data
            }
          },

          {
            $count: 'number'
          }

        ]).toArray()
        resolve(statusCount)

        console.log("this is STATUS COUNT");
        console.log(statusCount);
      } catch (err) {
        reject(err)
      }
    })
  },
  totalCost: () => {
    return new Promise(async (resolve, reject) => {
      try {
        total = await db.get().collection(collection.orderCollection).aggregate([
          // {
          //   $match: {
          //     delivarystatus: "pending"
          //   }
          // },

          {
            $project: {
              'orderData.Total_Amount': 1
            }
          },
          {
            $group: {
              _id: null,
              sum: { $sum: '$orderData.Total_Amount' }
            }
          }
        ]).toArray()
        resolve(total)

        console.log("this is the  total cost");
        console.log(total);
      } catch (err) {
        reject(err)
      }
    })
  },


}