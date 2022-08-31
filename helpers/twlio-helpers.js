// const async = require('hbs/lib/async');

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')('AC4d4fd6cac826d0c73c130f3c8bbb8e90','c0bb4d3ae742e73b7026044d41864d3f');

// client.verify.services('VAb7deb9cc0ed69121035032300b21b18f')
//              .verifications
//              .create({to: '+919048086615', channel: 'sms'})
//              .then(verification => console.log(verification.sid));

require('dotenv').config({ path: require('find-config')('.env') })

const accountId=process.env.TWILIO_ACCOUNT_ID
const serviceId=process.env.TWILIO_SERVICE_ID
const token=process.env.TWILIO_AUTHTOKEN

const client = require('twilio')(accountId,token);
const serviceSid=serviceId

             module.exports={
                dosms:(noData)=>{
                    let res={}
                    return new Promise(async(resolve,reject)=>{
                    try {
                            await client.verify.services(serviceSid).verifications.create({
                                to :`+91${noData.mobile}`,
                                channel:"sms"
                            }).then((res)=>{
                                res.valid=true;
                                resolve(res)
                                // console.log(res);
                            })
                    } catch (error) {
                        console.log(error);
                        reject(error)
                        
                    }
                    })
                },


                otpVerify:(otpData,nuData)=>{
                    let resp={}

                    console.log(otpData.otp);
                    return new Promise(async(resolve,reject)=>{
                     try {
                           await client.verify.services(serviceSid).verificationChecks.create({
                               to:   `+91${nuData.mobile}`,
                               code:otpData.otp
                           }).then((resp)=>{
                               // console.log("verification success");
                               // console.log(resp);
                               resolve(resp)
                           })
                     } catch (error) {
                        console.log(error);
                        reject(error)
                        
                     }
                    })
                }

             }
             