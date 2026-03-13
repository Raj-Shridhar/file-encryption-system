const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api",fileRoutes);

app.listen(3000,()=>{
console.log("Server running on port 3000");
});