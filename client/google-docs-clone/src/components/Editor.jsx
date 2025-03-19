"use client";

import { useEffect, useState, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { Box } from "@mui/material";
import styled from "@emotion/styled";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const Component = styled.div`
  background: #f5f5f5;
`; 
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

const Editor = () => {
  const [socket, setScoket] = useState(null);
  const quillRef = useRef(null);
  const containerRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const socketServer = io("http://localhost:9000");
    setScoket(socketServer);

    return () => socketServer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quillInstance = new Quill(containerRef.current, {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    });
    quillInstance.disable();
    quillInstance.setText("Loading the Document/Carregando o Documento...");
    quillRef.current = quillInstance;
  }, []);


  useEffect(()=>{
    if(!socket || !quillRef.current) return;

    const handleChange = (delta,oldData,source)=>{
        if(source === "user"){
            socket.emit("send-changes",delta);
        }
    };

    quillRef.current.on("text-change",handleChange);
    return ()=> quillRef.current.off("text-change",handleChange)
  },[socket]);

  useEffect(()=>{
    if(!socket || !quillRef.current) return;

    const handleReciveChange = (delta)=>{
        quillRef.current.updateContents(delta)
    }

    socket.on("receive-changes",handleReciveChange);
    return ()=> socket.off("receive-changes",handleReciveChange);
  },[socket]);

  useEffect(()=>{
    if(!socket || !quillRef.current) return;
    
    socket.once("load-document",(document)=>{
        quillRef.current.setContents(document);
        quillRef.current.enable();
    })
    socket.emit("get-document",id);

  },[socket,id]);

  useEffect(()=>{
    if(!socket || !quillRef.current) return;

    const interval = setInterval(()=>{
        socket.emit("save-document", quillRef.current.getContents());
    },2000);

    return ()=>clearInterval(interval);

  },[socket]);

  return(
    <Component>
        <Box className="container" ref={containerRef} id="container"></Box>
    </Component>
  )


};
export default Editor;
