//0OMl91O51VWERILs
//mongodb+srv://Hamed:<password>@cluster0.0oy7v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const express = require('express');
const mongoose = require('mongoose');
const bodyParser =  require("body-parser");
const path = require('path')

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')

const app = express();

mongoose.connect('mongodb+srv://Hamed:0OMl91O51VWERILs@cluster0.0oy7v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
    .then(() => {
        console.log('successfully connected to MongoDB Atlas!');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB Atlas!');
        console.error(error);
    });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;