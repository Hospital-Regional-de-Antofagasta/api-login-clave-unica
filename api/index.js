const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const auth = require('./routes/auth')
const { loadConfig } = require('./config')

const app = express()
app.use(express.json())
app.use(cors())

// app.set('trust proxy')
// app.set('trust proxy', '127.0.0.1')
// app.set('trust proxy', function (ip) {
//     if (ip === '127.0.0.1' || ip === '123.123.123.123') return true // trusted IPs
//     else return false
//   })

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true })

loadConfig()

app.use('/hra/auth', auth)

module.exports = app