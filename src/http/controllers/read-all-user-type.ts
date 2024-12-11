import axios from 'axios'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'

export async function fetchUserNames(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const readUserHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)

  const readAllDutyHeadersSchema = z
    .object({
      authorization: z.string(),
    })
    .parse(request.headers)
  const { authorization: bearerAuth } = readAllDutyHeadersSchema
  const token = bearerAuth.split(' ')[1]

  try {
    verify(token, env.JWT_SECRET)
  } catch (error) {
    throw new InvalidJwtTokenError()
  }
  try {
    // use axios para gerar uma request interna
    const response = await axios.get('http://127.0.0.1:3333/users/readAll', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const users = response.data.user.users
    // Extraia os dados desejados da response completa
    const filteredUsers = users.map((user) => ({
      id: user.id,
      nome: user.nome,
      cpf: user.cpf,
      user_role: user.user_role,
    }))

    return filteredUsers
  } catch (error) {
    console.error('Error fetching user data:', error)
    return error
  }
}
