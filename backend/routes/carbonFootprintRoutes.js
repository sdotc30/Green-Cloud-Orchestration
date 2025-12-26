import { Router } from "express";
import express from 'express';
import axios from 'axios';


const router = express.Router();

router.post('/carbon-footprint', async (req,res)=>{
    const {regionValue} = req.body;
    const datetime = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const response = await axios.get('https://api.electricitymaps.com/v3/carbon-intensity/past', {
        params:{
            dataCenterRegion: regionValue,
            dataCenterProvider: 'aws',
            datetime: datetime
        },
        headers: {
            'auth-token': process.env.EMAPS_API_KEY
        }
    });
    res.status(200).json({
        regionCode: regionValue,
        carbonIntensity: response.data.carbonIntensity
    })
});

export default router;
