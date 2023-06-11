const app=require('./app.js')

const dotenv=require('dotenv')
const cloudinary=require('cloudinary')
const mongoose=require('mongoose')

const connectDatabase=require('./config/database.js')

//Handling uncaught Exception
process.on('uncaughtException',err=>{
    console.log(`Error: ${err.message}`)
    console.log("Shutting down the server due to uncaught Exception")
     process.exit(1);
})

  
//config
dotenv.config({path:'backend/config/config.env'})

//connecting to database
mongoose.set("strictQuery", true);
connectDatabase()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });



const server=app.listen(process.env.PORT,()=>{

    console.log(`Server is Working on http://localhost:${process.env.PORT}`)
})

//unhandled Promise Rejection

process.on('unhandledRejection',err=>{
    console.log(`Error: ${err.message}`)
    console.log("Shutting down the server due to Unhandled Promise Rejection")
     server.close(()=>{
        process.exit(1);
     })
})