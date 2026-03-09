require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const proxy = require('express-http-proxy')
const authMiddleware = require('./middleware/auth-middleware')

const app = express();
const PORT = process.env.PORT || 5000; 

const allowedOrigins = [
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// proxy options
const proxyOptions = {
    proxyReqPathResolver : (req)=>{
        return req.originalUrl.replace(/^\/v1/,'/api')
    },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
      proxyReqOpts.headers['x-user-email'] = srcReq.user.email;
      proxyReqOpts.headers['x-user-name'] = srcReq.user.name;
    }
    return proxyReqOpts;
  },
    proxyErrorHandler: (err,res,next)=>{
    console.error('Proxy error:', err.message)
    res.status(502).json({
      message: "Upstream service error",
            error: err.message,
        })
    }
}

app.use('/v1/designs', authMiddleware ,proxy(process.env.DESIGN,{
    ...proxyOptions,
}))

app.use('/v1/media/upload', authMiddleware ,proxy(process.env.UPLOAD,{
    ...proxyOptions,
     parseReqBody : false
}))

app.use('/v1/media', authMiddleware ,proxy(process.env.UPLOAD,{
    ...proxyOptions,
     parseReqBody : true
}))

app.use('/v1/subscription', proxy(process.env.SUBSCRIPTION,{
    ...proxyOptions,
}))

app.listen(PORT, () => {
    console.log(`Api Gateway Service running on port ${PORT}`)
    console.log(`Design Service running on port ${process.env.DESIGN}`)
    console.log(`Upload Service running on port ${process.env.UPLOAD}`)
    console.log(`Subcription Service running on port ${process.env.SUBSCRIPTION}`)
}
);