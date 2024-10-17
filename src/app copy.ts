import fastify from 'fastify';
import { appRoutes } from './http/routes';
import { ZodError } from 'zod';
import 'dotenv/config';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

export const app = fastify();
const allowedOrigins = ['http://127.0.0.1:5500', 'https://your-frontend-domain.com']; // Add your frontend's origin

app.register(fastifyJwt, {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '5m',
  },
});

app.options('*', (request, reply) => {
  reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  reply.header('Access-Control-Allow-Credentials', 'true'); // Enable credential sharing
  reply.header('access-control-allow-origin', 'http://127.0.0.1:5500')
  reply.send();
});

app.register(fastifyCookie);

app.register(appRoutes);

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error!', issues: error.format() });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  } else {
    // TODO: Send error to monitoring service
  }

  reply.status(500).send({ message: 'Internal server error' });
});