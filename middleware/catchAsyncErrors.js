module.exports=errFunc=>(req,res,next)=>{
    Promise.resolve(errFunc(req,res,next)).catch(next)
}