const express = require('express');
const exphbs = require('express-handlebars'); // Correct package import
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// Static Files
app.use(express.static('public'));

// Templating engine
app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main"}));
// app.engine('hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');


//connection pool
const pool= mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  yes        : process.env.DB_PASS,
  database        : process.env.DB_NAME

});
//connect DB
pool.getConnection((err, connection)=>{
  if(err) throw err;//not connected!
  console.log('DB Connected as ID' + connection.threadId);
});



const router = require ('./server/routes/user');
app.use('/', router);



app.listen(port, () => console.log(`Listening on port ${port}`));
