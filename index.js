require("dotenv").config()
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require('./src/utils/db');
connectDB();
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));

const userRoutes = require('./src/routes/userRoutes')
const clientRoutes = require('./src/routes/clientRoutes')
const categoryRoutes = require('./src/routes/categoryRoutes')
const itemRoutes = require('./src/routes/itemRoutes')
const cartRoutes = require('./src/routes/cartRoutes')
const orderRoutes = require('./src/routes/orderRoutes')

app.use("/v1/user",userRoutes)
app.use("/v1/client",clientRoutes)
app.use("/v1/category",categoryRoutes)
app.use("/v1/item",itemRoutes)
app.use("/v1/cart",cartRoutes)
app.use("/v1/order",orderRoutes)

app.get("/",(req,res)=>{
    res.send("Server is Active")
})
const PORT=process.env.PORT ||5010;
app.listen(PORT,()=>{
    console.log(`Server is Running On http://localhost:${PORT}`);
})
