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
    // Extract desired data from complete response
    const filteredCustomers = users.map((user) => ({
      id: user.id,
      nome: user.nome,
      cnpj: user.cnpj,
      email: user.email,
      responsavel: user.responsavel,
      services: user.services || [], // Ensure services is always an array
    }))

    if (cftv === 'true') {
      // Filter customers that have "Monitoramento" in their services array
      const filteredCustomersByType = filteredCustomers.filter(
        (user) =>
          Array.isArray(user.services) &&
          user.services.includes('Monitoramento'),
      )
      console.log(filteredCustomersByType)
      return filteredCustomersByType
    }
    return filteredCustomers
  } catch (error) {
    console.error('Error fetching user data:', error)
    return error
  }
}
