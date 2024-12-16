import mongoose from "mongoose"
import { db_Name } from "../constant.js"



const connectDb = async()=>{
    const mongouri =process.env.MONGODB_URI
    if(!mongouri){
        console.log("mongouri is not available");
    }
   try {
    
    const connectionInstance=await mongoose.connect(`${mongouri}/${db_Name}`)// this will return a object
    console.log(`DB is Connected Successfully ${db_Name}`)
    console.log(connectionInstance.connection.host ,"naw")
   

   } catch (error) {
       console.log('error in db',error)
       throw error

   }
}

export default connectDb



/**
 * try and catch mein wrap karna hai
 * async await lagana hai
 * .env file hamesa root mein rahega 
 * refresh token used to store in database (session  and cookie)
 */