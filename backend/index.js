import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import carbonFootprintRoutes from "./routes/carbonFootprintRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
}));
app.use(express.json());

app.use("/api", carbonFootprintRoutes);


app.listen(PORT, ()=>{ 
    console.log(`Server is running at http://localhost:${PORT}/api`);
});