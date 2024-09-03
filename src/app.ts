import express from "express";
import path from "path";
import routerAdmin from "./router-admin";
import router from "./router";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";

/** 1-Entrance **/
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(MORGAN_FORMAT));
/** 2-Sessions **/

/** 3-Views **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-Routers **/
app.use("/admin", routerAdmin); // SSR: EJS
app.use("/", router); // Middleware Design Pattern SPA: REACT

export default app;
