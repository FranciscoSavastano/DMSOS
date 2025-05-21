import { FastifyRequest, FastifyReply } from 'fastify'
import { verify } from 'jsonwebtoken'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'

export async function readUserByAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = verify(token, process.env.JWT_SECRET)
    const id = (payload as any).sub as string
    const usersRepo = new PrismaUsersRepository()
    const user = await usersRepo.findById(id)
    if (!user) {
      return reply.code(404).send({ error: 'User not found' })
    }
    return reply.send({ user })
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' })
  }
}