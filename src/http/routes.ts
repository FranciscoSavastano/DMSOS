import { type FastifyInstance } from 'fastify'
import { register } from './controllers/register'
import { authenticate } from './controllers/authenticate'
import { refreshToken } from './controllers/refresh-token'
import { forgotPassword } from './controllers/forgot-password'
import { resetPassword } from './controllers/reset-password'
import { createDuty } from './controllers/duty'
import { readUser } from './controllers/read-user'
import { readAllUser } from './controllers/read-all-users'
import { updateUser } from './controllers/update-user'
import { deleteUser } from './controllers/delete-users'

export async function appRoutes(app: FastifyInstance) {

  //Users

  app.post('/users', register)

  app.post('/users/read', readUser)

  app.get('/users/readAll', readAllUser)
  
  app.patch('/users/update', updateUser)

  app.delete('/users/delete', deleteUser)

  //
  
  app.post('/users/forgot-password', forgotPassword)

  app.patch('/users/reset-password', resetPassword)

  app.post('/sessions', authenticate)

  app.post('/sessions/refresh-token', refreshToken)

  app.post('/duty', createDuty)
}
