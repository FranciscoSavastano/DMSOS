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
export const app = fastify()
const allowedOrigins = [
  'http://127.0.0.1:5500', // For local development
  'http://192.168.10.246',
  'http://192.168.10.246:80',
  'http://dmsys.app.ci',
  'http://dmsysci01.ddns.me' //local microtik ip mapping
]

app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'), false)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['c', 'Content-Type', 'Authorization', 'Cookie'], // Add any custom headers your frontend sends
})
app.register(fastifyStatic, {
  root: join(__dirname, '/gendocs/'),
  prefix: '/statico/',
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '5m',
  },
})
app.register(multipart)
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

app.listen({ port: 3333, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server ouvindo em ${address}`)
})
