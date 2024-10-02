import { app } from './app'
import 'dotenv/config'

app
  .listen({
    host: '127.0.0.1',
    port: process.env.PORT,
  })
  .then(() => {
    console.log('Porta: ' + process.env.PORT)
    console.log('🚀 Servidor está rodando 🚀')
  })
