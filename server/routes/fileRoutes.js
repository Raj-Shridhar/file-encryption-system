const express = require("express");
const multer = require("multer");
const {v4:uuidv4} = require("uuid");
const db = require("../database");

const router = express.Router();

const storage = multer.diskStorage({

destination:"server/uploads/",

filename:(req,file,cb)=>{
cb(null,Date.now()+"-"+file.originalname);
}

});

const upload = multer({storage:storage});

router.post("/upload",upload.single("file"),(req,res)=>{

const fileId = uuidv4();

const sql="INSERT INTO files (file_id,file_name,path) VALUES (?,?,?)";

db.query(sql,[fileId,req.file.originalname,req.file.path],(err)=>{

if(err) throw err;

res.json({
message:"File uploaded",
link:`http://localhost:3000/api/download/${fileId}`
});

});

});

router.get("/download/:id",(req,res)=>{

const sql="SELECT * FROM files WHERE file_id=?";

db.query(sql,[req.params.id],(err,result)=>{

if(result.length==0) return res.send("File not found");

res.download(result[0].path);

});

});

module.exports = router;