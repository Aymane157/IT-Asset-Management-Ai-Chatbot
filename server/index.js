import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import route from "./routes/userRoutes.js"
import cors from "cors"
import session from "express-session"

const app =express();
app.use(bodyParser.json());

dotenv.config();
app.use(cors({
  origin: `${process.env.frontend}`, // Adjust this to your client URL
  credentials: true
}));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, //change for vscode normal
    maxAge: 1000 * 60 * 60 * 24, 
    sameSite: 'none'
  }
  
}));
const PORT=process.env.PORT ;
const MONGO_URL=process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
        .then(()=>{
            console.log("Db connected success");
            app.listen(PORT,()=>{
                console.log(`Server is running on : http://localhost:${PORT}`)
            });
        })
        .catch((err)=>{
            console.log(err);
        })
 app.use("/Asset",route);