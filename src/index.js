require('dotenv').config()
const express = require("express")
const authRouter = require("./routes/auth.router")
const movieRouter = require("./routes/movies.route")
const {sequelize} = require("./db");
const APP_PORT = process.env.APP_PORT

const app = express()
const corsMiddleware = require('./middleware/cors.middleware')

app.use(corsMiddleware)
app.use(express.json())
app.use("/api/auth", authRouter)
app.use("/api/movies", movieRouter)


const start = async () => {
    try {
        await sequelize.sync()
        console.log('Database synchronized')
        app.listen(APP_PORT, () => console.log('Server started on port:', APP_PORT))
    } catch (e) {
        console.log('error ', e)
    }
}

start()




