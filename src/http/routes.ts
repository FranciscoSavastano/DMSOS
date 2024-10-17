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
import { readDuty } from './controllers/read-duty'
import { readAllDuty } from './controllers/read-all-duties'
import { updateDuty } from './controllers/update-duty'
import { deleteDuty } from './controllers/delete-duty'
import { createOcurrenceType } from './controllers/ocurrence_types'

export async function appRoutes(app: FastifyInstance) {
  //Users

  app.post('/users', register)

  app.post('/users/read', readUser)

  app.get('/users/readAll', readAllUser)

  app.patch('/users/update', updateUser)

  app.delete('/users/delete', deleteUser)

  //Plantao
  app.post('/duty', createDuty)

  app.post('/duty/read', readDuty)

  app.get('/duty/readAll', readAllDuty)

  app.patch('/duty/update', updateDuty) 

  app.delete('/duty/delete', deleteDuty)

  app.post('/ocurrencetypes', createOcurrenceType)
  //Outros

  app.post('/users/forgot-password', forgotPassword)

  app.patch('/users/reset-password', resetPassword)

  app.post('/sessions', authenticate)

  app.post('/sessions/refresh-token', refreshToken)

  
}
