const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const auth = require('./routes/auth')
const { loadConfig } = require('./config')

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true })

loadConfig()

app.use('/hola', (req, res) => {
    res.send('Hola Mundo!!!!')
})

app.use('/hra/auth', auth)

module.exports = app