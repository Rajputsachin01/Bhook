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

// const userRoutes = require('./routes/userRoutes')

// app.use("/v1/user",userRoutes)

app.get("/",(req,res)=>{
    res.send("Server is Active")
})
const PORT=process.env.PORT ||5000;
app.listen(PORT,()=>{
    console.log(`Server is Running On http://localhost:${PORT}`);
})
