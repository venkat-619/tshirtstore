require('dotenv').config();

const express = require('express');
const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')
const file  = fs.readFileSync('./swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// temp check
app.set("view engine", "ejs");

// regular middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));

// morgan middleware
app.use(morgan('tiny'));


// import all routes here
const home = require('./routes/home');
const user = require('./routes/user');
const product = require('./routes/product');
const payment = require('./routes/payment');
const order = require('./routes/order');

// router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', payment);
app.use('/api/v1', order);

// test route
app.get("/signuptest", (req,res) =>{
    res.render('signupTest');
});

// export app js
module.exports = app;