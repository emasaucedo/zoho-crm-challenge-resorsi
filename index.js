import express from "express";
import leadRoutes from "./routes/leads.routes.js";
import tokenMiddleware from "./middlewares/tokenMiddleware.js";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use(tokenMiddleware, leadRoutes);

app.listen(3000);
console.log("Server on port", 3000);