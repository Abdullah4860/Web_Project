const express=require('express')
const cors=require('cors')
const app =express();
const cookieParser=require('cookie-parser')
const bodyParser=require('body-parser')
const fileUpload=require('express-fileupload')
const dotenv=require('dotenv')
const errorMiddleware=require('./middleware/error')

app.use(cors({credentials:true, methods:['GET',"PUT",'POST','PATCH', 'DELETE'], origin:'http://localhost:3000'}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())
dotenv.config({path:'backend/config/config.env'})
//route imports
const product=require('./routes/productRoute.js')
const user=require('./routes/userRoute.js')
const order=require('./routes/orderRoute.js')
const payment=require('./routes/paymentRoute.js')


app.use('/api/v1',product)
app.use('/api/v1',user)
app.use('/api/v1',order)
app.use('/api/v1',payment)
//middleware for error
app.use(errorMiddleware)

module.exports=app