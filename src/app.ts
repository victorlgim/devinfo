import express, { Application } from "express"
import { startDatabase } from "./database"

const app: Application = express()
app.use(express.json())

app.listen(3000, async () => {
    console.log('Server is running!')
    await startDatabase()
})