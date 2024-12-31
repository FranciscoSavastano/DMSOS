import axios from 'axios'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'

export async function fetchCustomerNames(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const readUserHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const readUserParamSchema = z
    .object({
      cftv: z.string(),
    })
    .parse(request.params)

  const { authorization: bearerAuth } = readUserHeadersSchema
  const { cftv } = readUserParamSchema
  const token = bearerAuth.split(' ')[1]

  try {
    verify(token, env.JWT_SECRET)
  } catch (error) {
    throw new InvalidJwtTokenError()
  }
  try {
    // use axios para gerar uma request interna
    const response = await axios.get('http://127.0.0.1:3333/clientes/readAll', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const users = response.data.cust.custs
    // Extraia os dados desejados da response completa
    const filteredCustomers = users.map((user) => ({
      id: user.id,
      nome: user.nome,
      cnpj: user.cnpj,
      email: user.email,
      responsavel: user.responsavel,
      has_cftv: user.has_cftv,
    }))
    if (cftv === 'true') {
      const filteredCustomersByType = filteredCustomers.filter(
        (user) => user.has_cftv,
      )

      return filteredCustomersByType
    }
    return filteredCustomers
  } catch (error) {
    console.error('Error fetching user data:', error)
    return error
  }
}
