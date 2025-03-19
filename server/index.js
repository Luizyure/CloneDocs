import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";
import { Server} from "socket.io";
import { getDocument,updateDocument } from "./controller/document-controller.js";

const PORT = ENV_VARS.PORT

const io = new Server(PORT,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
    },
})
connectDB();

io.on("connection",(socket)=>{
    socket.on("get-document",async(documentId)=>{
        const document = await getDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document",document.data);
        
        socket.on("send-changes",(delta)=>{
            socket.broadcast.to(documentId).emit("receive-changes",delta);
        });

        socket.on("save-document",async (data)=>{
            await updateDocument(documentId,data);
        });
    });
});