const ErrorHandler = require('../utils/errorhandler.js');
const catchAsyncErrors=require('../middleware/catchAsyncErrors')
const User=require('../model/userModel');
const sendToken = require('../utils/token.js');
const sendEmail=require("../utils/sendEmail.js")
const crypto=require("crypto")
const cloudinary=require('cloudinary')

exports.registerUser=catchAsyncErrors(async(req,res,next)=>{

    const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
      folder:"avatars",
      width:150,
      crop:"scale"

    })

    const {name, email, password}=req.body;

    const user= await User.create({
        name,email,password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    })

    sendToken(user,201,res)

})

//Login User

exports.loginUser=catchAsyncErrors(async(req,res,next)=>{


    const {email, password}=req.body;

//checking if password and email match
 
    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email and Password",400));
    }

    const user= await User.findOne({email}).select("+password");

    if(!user){
         return next(new ErrorHandler("Invalid email or password",401))
    }

    const isPasswordMatched=user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password",401))
   }
   sendToken(user,201,res)
   

})

//Logout User

exports.logout=catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message:"logged out Successfully"
    });
})


//forgot Password

exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{


    const user=await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found",404))
    }

    //Get resetPassword Token

    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message= `Your password rest token is : \n\n ${resetPasswordUrl} \n\n If you have not
     requested this then ignore this`

     try {

        await sendEmail({
            email:user.email,
            subject:'Ecommerce Password Recovery',
            message

        });

        res.statsu(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
        
     } catch (error) {
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined
        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message,500))
     }
})

//reset Password
exports.resetPassword= catchAsyncErrors(async(req,res,next)=>{
  

    const resetPasswordToken=crypto
  .createHash("sha256")
  .update(req.params.token)
  .digest('hex')

  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}
  })

  if(!user){
    return next(new ErrorHandler("Reset password Token is invalid or has been expiredd",400))
  }

  if(req.body.password!==req.body.confirmPassword){
    return next(new ErrorHandler("Password does not match",400))
  }

  user.password=req.body.password;
  user.resetPasswordToken=undefined
  user.resetPasswordExpire=undefined

 await user.save()

 sendToken(user,200,res)

})

// Get User Details

exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        user
    })



})

//Change Password 

exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    console.log(req)
    console.log('userid:',req.user.id)
    const user=await User.findById(req.user.id).select("+password")

    const isPasswordMatched=user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Old Password",400))
   }


  if(req.body.newPassword!==req.body.confirmPassword){
    return next(new ErrorHandler("Password does not match",400))
  }

user.password=req.body.newPassword;
user.save();

sendToken(user,200,res)

})

//Update User Profile

exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{

    const newUser= {
        email:req.body.email,
        name:req.body.name
    }

    // if(req.body.avatar !== ""){
    //      const user = await User.findById(req.user.id);
         
    //       const imageId = user.avatar.public_id;

    //     await cloudinary.v2.uploader.destroy(ImageId);
    //     const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
    //         folder: "avatars",
    //         width:"150",
    //         crop: "scale",
    //     });
    //     newUserData.avatar={
    //         public_id : myCloud.public_id,
    //         url:myCloud.secure_url
    //     }
    // }

    const user= await User.findByIdAndUpdate(req.user.id,newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })

})

//Get All users(Admin)

exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{

   const users=await User.find();

   res.status(200).json({
    success:true,
    users
   })

})

//Get Details of Single User(Admin)

exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler("User does not exist with the Given Id",400))
    }

    res.status(200).json({
     success:true,
     user
    })

})

//Update User Profile (Admin)

exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{

    const newUser= {
        email:req.body.email,
        name:req.body.name,
        role:req.body.role

    }

    const user= await User.findByIdAndUpdate(req.params.id,newUser,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })

})

//Delete User (Admin)

exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{

  

   const user=await User.findById(req.params.id);

   
   if(!user){
    return next(new ErrorHandler("User does not exist with the Given Id",400))
}


await user.remove();

   res.status(200).json({
    success:true,
    message:"User Deleted Successfully"
})

})