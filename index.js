const express = require('express')
const app = express()

const web = require('./web')

app.use(express.json())

app.use('/', web)

app.listen(9898, () => {
  console.log("ToastDB server is listening on port: 9898")
})