import express from "express";
import middlewares from "./middlewares";
import serverRoutes from "./routes";

const app = express();


middlewares(app);
serverRoutes(app);

module.exports = app;
