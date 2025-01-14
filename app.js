import express from "express";
import dotenv from 'dotenv'
import * as fs from 'fs';
import { conn } from "./db/config.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"

dotenv.config()

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 5001;
const app = express();
app.use(express.json())


/////////////////////////////////////////////////////////////////////////
///////////////////////////////////// GET
//  Ej: /
////////////////////////////////////////////////////////////////////////

app.get("/", (req,res) => {
  res.send(`El Servidor está online , en el puerto:${port}`)
})

/////////////////////////////////////////////////////////////////////////
///////////////////////////////////// POST REGISTRAR USUARIO 
//  Ej:  /newusu 
////////////////////////////////////////////////////////////////////////
app.post("/newusu", async (req,res) => {
  res.header("Access-Control-Allow-Origin", "*")     
  const {usu,pas,tipousu} = req.query;
  
  if (!usu || !pas || !tipousu ){
       return res.status(200).json( { 
           ok:false,
           msg: "Missing required fields: usuario, password ò role",
           usu,
           pas,
           tipousu
   
           })
      
  }else{

       // VERIFICAMOS QUE EL USUARIO NO EXISTE
       const resultado = await conn.query("select count(*) as count from users where username='"+usu+"' and password='"+pas+"'");

       const {count} = resultado[0][0]  
       
       if(count>0){
           return res.status(200).json({
               ok: false ,
               msg: "user already exists"
           })        
       }

       //const JWT = process.env.JWT_SECRET
       
      //  const token = jwt.sign({
      //     usu,
      //     pas
      //  },
      //     JWT 
      //  )

      //  const salt = bcrypt.genSaltSync(10);
      //  const hash = bcrypt.hashSync(pas, salt);
       const result= await conn.query( 'INSERT into users (  username,password,role ) values ( ?,?,? )',[usu,pas,tipousu]) 
       const {affectedRows,insertId} = result[0]

       if ( affectedRows == 1 ){
       
           res.status(200).json({
               ok: true,
               msg: "Succes!",
               Id : insertId
   
           })
           
       } else {
           res.status(200).json({
               ok: false,
               msg:"Failed!"
           })
       }
      
  }
     
})


/////////////////////////////////////////////////////////////////////////
///////////////////////////////////// GET LOGIN
//  Ej:  /login 
/////////////////////////////////////////////////////////////////////////
app.get("/login", async (req,res) => {
  const {usu,pas} = req.query;
  
  if (!usu || !pas){
       return res.status(200).json( { ok: false, msg: "Missing required fields: username, password" })
      
  }else{

       // VERIFICAMOS QUE EL usuaario + password NO EXISTE!

       const resultado = await conn.query("select count(*) as count,username, password,role from users where username='"+usu+"' and password='"+pas+"'");

       const {count,username,password,role} = resultado[0][0]  
       
       if(count===0){
           return res.status(200).json({
               ok: false ,
               msg: "User not found"
           })        
       }

      //  const isMatch = await bcrypt.compare( pas, password )
      //  if(!isMatch) {
      //     return res.status(200).json({
      //         ok:false,
      //         msg: "Invalid credentials"
              
      //     })
      //  }

       const JWT = process.env.JWT_SECRET
       const token = jwt.sign({
        usu,
        pas
       },
          JWT 
       )

       res.status(200).json({
       ok:true,
         msg: "valid credentials",	      
       data: {
         username,
         role,
       },
         token
 })

      
  }
     
})


/////////////////////////////////////////////////////////////////////////
///////////////////////////////////// GET  LISTADO DE USUARIOS
//   Ej: /stat
////////////////////////////////////////////////////////////////////////
app.get("/stat", async (req,res) => {
  try {
      const result = await conn.query("select * from users");
      res.json(result[0]);       
  }catch (error) {
   console.log("error"+error);
   res.status(200).json({ error } )   
  }	
})


const content =  'server started on '+port;

fs.writeFile('test.txt', content, err => {
  if (err) {
    console.error(err);
  } else {
    // file written successfully
  }
});

app.listen(port, () => console.log(`server started on ${port}`))
