const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const abc  = require('../models/DOSCG');
require('dotenv').config('../../.env');

const router = express.Router();
const app = express();

app.use(express.json());

const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

router.get('/', (req, res) => {
    res.send('Hello SCG!');
});

router.get('/direction', cache, getDirection);

router.get('/xyz', (req, res) => {
    const xyz = [
        { val: "X" }, 
        { val: "Y" }, 
        { val: 5 },  
        { val: 9 }, 
        { val: 15 }, 
        { val: 23 }, 
        { val: "Z" }
    ];

    //  Y - X  is  0
    //  5 - Y  is  2
    //  9 - 5  is  4
    // 15 - 9  is  6
    // 23 - 15 is  8
    //  Z - 23 is 10

    let arr= [];
    for (i = 0; i < xyz.length; i++) {
        if (i > 0) {
            arr[i]  = xyz[i+1]-(i*2) ;
        } 
        // else {
        //     arr[i] = 0;
        // }
    }

    // let arr= [];
    // for (i = 0; i < myArray.length; i++) {
        // text += cars[i] + "<br>";
    //    if (isNan(myArray[i])) {
        // arr[i] 
    //    }

    // const five = xyz.find(x => x.val === 5).value;
    // const nine = xyz.find(x => x.val === 9).value;
    // const fifteen = xyz.find(x => x.val === 15).value;
    // const twentythree = xyz.find(x => x.val === 23).value;

    // let arr= [];
    // for (i = 0; i < myArray.length; i++) {
        // text += cars[i] + "<br>";
    //    if (isNan(myArray[i])) {
        // arr[i] 
    //    }

        // arr[i] = myArray[];
    // }
    
    // const xyz = [
    //     { key: 0, value: "X" },
    //     { key: 1, value: "Y" },
    //     { key: 2, value: 5 },
    //     { key: 3, value: 9 },
    //     { key: 4, value: 15 },
    //     { key: 5, value: 23 },
    //     { key: 6, value: "Z" },
    // ];
    // const five = model.find(x => x.id === 5).value;
    // const nine = xyz.find(x => x.value === 9).value;
    // const fifteen = xyz.find(x => x.value === 15).value;
    // const twentythree = xyz.find(x => x.value === 23).value;
    
    // const XYZ = {
        // five: five
        // nine: nine,
        // fifteen: fifteen,
        // twentythree: twentythree
    // };
    res.send(arr);
});

router.get('/abc', (req, res) => {
    // const a = 21;
    // const ab = 23;
    // const ac = -21;
    const a = abc.find(x => x.id === "a").value; 
    const ab = abc.find(x => x.id === "ab").value;
    const ac = abc.find(x => x.id === "ac").value;

    // const b = 23-21;
    const b = ab-a;

    // const c = -21-21
    const c = ac-a

    const bc = { 
        b: b,
        c: c
    };

    res.send(bc);
});

// Google Direction
async function getDirection(req, res, next) {
    try {
        console.log("Fetching direction ...");

        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const api_url = `https://maps.googleapis.com/maps/api/directions/json?origin=13.805381,100.539025&destination=13.746314,100.539276&key=${GOOGLE_API_KEY}`;
        const fetch_response = await fetch(api_url);
        const data = await fetch_response.json();
        const stringifyData = JSON.stringify(data);

        // Set data to Redis
        client.setex(GOOGLE_API_KEY, 3600, stringifyData);
        
        res.send(data);
    } catch (err) {
        console.error(err);
        res.status(500);
    }
}

// Cache middleware
function cache(req, res, next) {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    client.get(GOOGLE_API_KEY, (err, data) => {

        if (err) throw err;

        if(data!== null) {
            res.send(JSON.parse(data));
        } else {
            next();

        }
    })
}

module.exports = router;