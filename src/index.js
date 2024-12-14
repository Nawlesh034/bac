import dotenv from 'dotenv';

dotenv.config();
import { app } from './app.js';
import connectDb from "./db/db.js";


connectDb()
.then(()=>{
    app.on("error",(err)=>{
        console.log(`error on listening at `)
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is connected at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb error ",err)
});