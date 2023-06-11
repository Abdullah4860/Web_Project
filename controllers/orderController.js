const Order=require('../model/orderModel')
const Product=require('../model/productModel.js');
const ErrorHandler = require('../utils/errorhandler.js');
const catchAsyncErrors=require('../middleware/catchAsyncErrors')

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
      shippingInfo,
      orderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;
  
    const order = await Order.create({
      shippingInfo,
      orderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user.id
    });
  
    res.status(201).json({
      success: true,
      order
    });
  });
  
  
  

//Get Single Order --Admin

exports.getSingleOrder = catchAsyncErrors(async(req,res,next)=>{
  
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    )

    if(!order){
        return next(new ErrorHandler("Order not found",404))
    }

    res.status(200).json({
        success:true,
        order
    })

})


//Get My Order 

exports.myOrder = catchAsyncErrors(async(req,res,next)=>{
  
    const orders = await Order.find({user:req.user._id})

   

    res.status(200).json({
        success:true,
        orders
    })

})

//Get All Orders --Admin

exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
  
    const orders = await Order.find()

   let totalAmount=0;

   orders.forEach(order => {
    totalAmount+=order.totalPrice;
   });

    res.status(200).json({
        success:true,
        orders,
        totalAmount
    })

})

//update Order status --Admin

exports.updateOrder = catchAsyncErrors(async(req,res,next)=>{
  
    const order  = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found",404))
    }


    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order",404));
    }

   order.orderItems.forEach(async(o)=>{
    await updateStock(o.product,o.quantity)
   })

   order.orderStatus=req.body.status;

   if(req.body.status==="Delivered"){
    order.deliveredAt=Date.now()
   }

   await order.save({validateBeforeSave:false})

    res.status(200).json({
        success:true
    
    })

})

async function updateStock(id, quantity) {
    const product = await Product.findById(id).exec();
  
    if (!product) {
      throw new ErrorHandler('Product not found', 404);
    }
  
    product.Stock -= quantity;
  
    await product.save({ validateBeforeSave: false });
  }
  

//Delete Order --Admin

exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
  
    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found",404))
    }

  await order.remove();

    res.status(200).json({
        success:true
        
    })

})