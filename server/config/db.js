import moongose from "mongoose";
import { ENV_VARS } from "./envVars.js";


export const connectDB = async () =>{
    try{
        const conn = await moongose.connect(ENV_VARS.MONGO_URI);
        console.log("MongoDB connect: " + conn.connection.host)
    }catch(error){
        console.error("Error connection to MONGODB: " + error.message)
        process.exit(1)
    }
};








