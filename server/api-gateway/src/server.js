require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const proxy = require('express-http-proxy')

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// proxy options
const proxyOptions = {
    proxyReqPathResolver : (req)=>{
        return req.originalUrl.replace(/^\v1/,'/api')
    },
    proxyErrorHandler: (err,res,next)=>{
        res.status(500).json({
            message: "Internal server error!",
            error: err.message,
        })
    }
}

app.use('/v1/design', proxy(process.env.DESIGN,{
    ...proxyOptions,
}))

app.use('/v1/media', proxy(process.env.UPLOAD,{
    ...proxyOptions,
     parseReqBody : false
}))

app.use('/v1/subscription', proxy(process.env.SUBSCRIPTION,{
    ...proxyOptions,
}))

app.listen(PORT, () =>
      console.log(`Api Gateway Service running on port ${PORT}`),
      console.log(`Design Service running on port ${process.env.DESIGN}`),
      console.log(`Upload Service running on port ${process.env.UPLOAD}`),
      console.log(`Subcription Service running on port ${process.env.SUBSCRIPTION}`),
    );