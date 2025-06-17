import fastify from 'fastify'
import { appRoutes } from './http/routes'
import { ZodError } from 'zod'
import 'dotenv/config'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import multipart from '@fastify/multipart'
import cors from '@fastify/cors'
import { dirname, join } from 'path'
import '@fastify/static'
import { fastifyStatic } from '@fastify/static'

export const app = fastify({
  bodyLimit: 50 * 1024 * 1024, // Set the limit to 50MB
})

const allowedOrigins = [
  'http://127.0.0.1:5500', // For local development
  'http://localhost:63342', // For local development with JetBrains IDEs
  'http://127.0.0.1',
  'http://192.168.10.246',
  'http://192.168.10.246:80',
  'http://dmsys.app.ci',
  'http://dmsysci01.ddns.me',
  'http://200.142.98.17', //local microtik ip mapping
]

app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'), false)
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['c', 'Content-Type', 'Authorization', 'Cookie', 'Retry-After', 'content-disposition', 'Content-Custom-Header'], 
})

app.register(fastifyStatic, {
  root: join(__dirname, '/gendocs/'),
  prefix: '/statico/',
})

app.addHook('onSend', async (request, reply, payload) => {
  reply.header('Access-Control-Expose-Headers', 'content-disposition');
  return payload;
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'Authorization',
    signed: false,
  },
  sign: {
    expiresIn: '24h', // Default for access tokens
  },
  decode: { complete: true },
})

app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // Optional: Set the file size limit to 50MB for multipart requests
  },
})

app.register(fastifyCookie)

app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error!', issues: error.format() })
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Send error to monitoring service
  }

  reply.status(500).send({ message: 'Internal server error' })
})

console.log('===== VERIFICAÇÃO DO FUSO HORÁRIO =====');
console.log(`Fuso horário configurado: ${process.env.TZ || 'Não definido'}`);
console.log(`Data e hora atual: ${new Date().toString()}`);
console.log(`Offset em horas: ${new Date().getTimezoneOffset() / -60}`);
console.log(`Timezone do Intl: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
console.log('======================================');

app.listen({ port: 3333, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server ouvindo em ${address}`)
})
