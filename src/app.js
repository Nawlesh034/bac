import express from "express"
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app =express()
app.use(cors({
    origin:process.env.CORS_ORIGIN ,
    optionsSuccessStatus:200,
    credentials:true
}))
app.use(express.json({
    limit:'16kb'  //json data upload by this //form data
}))
app.use(express.urlencoded({
    extended:true,   //url data by this
    limit:"16kb"
}))
app.use(express.static("public")) //images ,pdf can save in this
app.use(cookieParser()) 

export {app}



/*
* app.use for middleware


*/