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

const categoryRoutes = require('./src/routes/categoryRoutes')
const clientRoutes = require('./src/routes/clientRoutes')

app.use("/v1/category",categoryRoutes)
app.use("/v1/client",clientRoutes)

app.get("/",(req,res)=>{
    res.send("Server is Active")
})
const PORT=process.env.PORT ||5010;
app.listen(PORT,()=>{
    console.log(`Server is Running On http://localhost:${PORT}`);
})
