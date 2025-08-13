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
      bodyLimit: 50 * 1024 * 1024,
    })

    // Handlers globais para erros não capturados
    process.on('uncaughtException', (error) => {
      console.error('Erro não capturado:', error)
      // Log do erro mas não fecha a aplicação
    })

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Promise rejeitada não tratada:', reason)
      // Log do erro mas não fecha a aplicação
    })

    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:63342',
      'http://localhost:65250',
      'http://localhost:63343',
      'http://127.0.0.1',
      'http://192.168.10.246',
      'http://192.168.10.246:80',
      'http://dmsys.app.ci',
      'http://dmsysci01.ddns.me',
      'http://200.142.98.17',
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

    // Corrigir o erro do JWT
    app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'fallback-secret', // Adicionar fallback
      cookie: {
        cookieName: 'Authorization',
        signed: false,
      },
      sign: {
        expiresIn: '24h',
      },
      decode: { complete: true },
    })

    app.register(multipart, {
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    })

    app.register(fastifyCookie)

    app.register(appRoutes)

    // Melhorar o error handler para capturar erros do Prisma
    app.setErrorHandler((error, request, reply) => {
      // Log detalhado do erro
      console.error('Erro capturado pelo handler:', {
        message: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
      })

      if (error instanceof ZodError) {
        return reply
          .status(400)
          .send({ message: 'Validation error!', issues: error.format() })
      }

      // Verificar se é erro do Prisma
      if (error.name?.includes('Prisma') || error.message?.includes('Prisma')) {
        console.error('Erro do Prisma detectado:', error.message)
        return reply
          .status(500)
          .send({ message: 'Database error', error: 'Database temporarily unavailable' })
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