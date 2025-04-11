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
import { fetchUserNames } from './controllers/read-all-user-type'
import {
  CreatePdf,
  initWrite,
  sendPdf,
  writeDesc,
  writeRondasUnion,
} from '@/utils/create-pdf'
import { readAllUserDuty } from './controllers/read-all-user-duties'
import { registerCust } from './controllers/register-cust'
import { readAllCust } from './controllers/read-all-customers'
import { fetchCustomerNames } from './controllers/read-all-customer-names'
import { gptCorrection } from './controllers/gpt-helper'
import { verifySession } from './controllers/verify-session'
import { updateCustomer } from './controllers/update-customer'
import { readCust } from './controllers/read-cust'
import { getPdfReport } from '@/utils/search-pdf'
import { createRevisao } from './controllers/revisao'

export async function appRoutes(app: FastifyInstance) {
  //Users

  app.post('/users', register)

  app.post('/clientes', registerCust)

  app.post('/clientes/read/:id', readCust)

  app.get('/clientes/readAll', readAllCust)

  app.get('/clientes/getnames/:cftv', fetchCustomerNames)

  app.patch('/clientes/update', updateCustomer)

  app.post('/users/read/:id', readUser)

  app.get('/users/readAll', readAllUser)

  app.patch('/users/update', updateUser)

  app.delete('/users/delete', deleteUser)

  app.get('/users/getnames/:user_role', fetchUserNames)

  //Plantao
  app.post('/duty', createDuty)

  app.post('/duty/union', writeRondasUnion)

  app.post('/duty/read', readDuty)

  app.get('/duty/readAll', readAllDuty)

  app.post('/duty/readAllUserDuty', readAllUserDuty)

  app.patch('/duty/update', updateDuty)

  app.delete('/duty/delete', deleteDuty)

  app.post('/ocurrencetypes', createOcurrenceType)
  //Outros

  app.post('/users/forgot-password', forgotPassword)

  app.patch('/users/reset-password', resetPassword)

  app.post('/sessions', authenticate)

  app.post('/sessions/refresh-token', refreshToken)

  app.get('/createpdf', CreatePdf)

  app.post('/writeFiles', initWrite)

  app.post('/writeDescriptions', writeDesc)

  app.get('/download', sendPdf)

  app.get('/gpthelper', gptCorrection)

  app.get('/sessions/verify', verifySession)

  app.post('/v1/users', register)

  app.post('/v1/clientes', registerCust)

  app.post('/v1/clientes/read/:id', readCust)

  app.get('/v1/clientes/readAll', readAllCust)

  app.get('/v1/clientes/getnames/:cftv', fetchCustomerNames)

  app.patch('/v1/clientes/update', updateCustomer)

  app.post('/v1/users/read/:id', readUser)

  app.get('/v1/users/readAll', readAllUser)

  app.patch('/v1/users/update', updateUser)

  app.delete('/v1/users/delete', deleteUser)

  app.get('/v1/users/getnames/:user_role', fetchUserNames)

  //Plantao
  app.post('/v1/duty', createDuty)

  app.post('/v1/duty/union', writeRondasUnion)

  app.post('/v1/duty/read', readDuty)

  app.get('/v1/duty/readAll', readAllDuty)

  app.post('/v1/duty/readAllUserDuty', readAllUserDuty)

  app.patch('/v1/duty/update', updateDuty)

  app.delete('/v1/duty/delete', deleteDuty)

  app.get('/v1/duty/pdf/:id', getPdfReport)

  app.post('/v1/duty/revisao', createRevisao)
  
  app.post('/v1/ocurrencetypes', createOcurrenceType)
  //Outros

  app.post('/v1/users/forgot-password', forgotPassword)

  app.patch('/v1/users/reset-password', resetPassword)

  app.post('/v1/sessions', authenticate)

  app.post('/v1/sessions/refresh-token', refreshToken)

  app.get('/v1/createpdf', CreatePdf)

  app.post('/v1/writeFiles', initWrite)

  app.post('/v1/writeDescriptions', writeDesc)

  app.get('/v1/download', sendPdf)

  app.get('/v1/gpthelper', gptCorrection)

  app.get('/v1/sessions/verify', verifySession)
  
  app.get('/v1/reset-password', resetPassword)  

}
