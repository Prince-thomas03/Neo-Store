const multer=require('multer')
// const uuid=require('uuid').v4
// const path=require('path')


const storage=multer.diskStorage({

destination:(req,file,cb)=>{

cb(null,'public/multerImage')

},

filename:(req,file,cb)=>{
    var ext=file.originalname.substr(file.originalname.lastIndexOf('.'))
    cb(null,file.fieldname+'-'+Date.now()+ext);
}

})



module.exports=store=multer({storage})