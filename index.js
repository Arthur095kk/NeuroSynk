import express from 'express'
const app = express()
app.use(express.json())
const port = 3000

import UsuarioRouter from './router/usuario-router.js';

app.use('/usuarios', UsuarioRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
