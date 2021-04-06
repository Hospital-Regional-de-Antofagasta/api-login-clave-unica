const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const auth = require('./routes/auth')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true })

app.use('/hra/auth', auth)

module.exports = app