import { createPool } from "mysql2/promise";

export const conn =  createPool({
    host:'localhost',
    user:'root',
    password:'9521',
    port:3306,
    database:'pruebas'
})