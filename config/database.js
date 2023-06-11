const mongoose=require('mongoose');
const dotenv=require('dotenv')
dotenv.config({path:'backend/config/config.env'})

const uri='mongodb+srv://Ecommerce:'+process.env.MONGO_ATLAS_PW+'@cluster0.rhojf70.mongodb.net/?retryWrites=true&w=majority';
const connectDatabase=()=>{mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true}).then((data)=>{
    console.log(`Mongodb connected with Server:${data.connection.host}`)
})}
 
module.exports=connectDatabase
