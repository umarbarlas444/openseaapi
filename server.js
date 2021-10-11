const express = require('express')
const app = express()
const port = process.env.PORT || 3030
const parser = require('body-parser')

app.use(parser.json())
const homeRoute = require('./routes/home')

app.use('/', homeRoute)

// Setting Views Engine - ejs
app.set('view engine', 'ejs');
app.set('views', './views');

app.listen(port, console.log(`App is running at port ${port}`))