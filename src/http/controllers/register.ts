import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists'
import { makeRegisterUseCase } from '@/use-cases/factories/make-register-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z
    .object({
      nome: z.string(),
      email: z.string().email(),
      cpf: z.string(),
      password: z.string().min(6),
    })
    .parse(request.body)

  const { nome, email, cpf, password } = registerBodySchema

  try {
    const registerUserCase = makeRegisterUseCase()

    const { user } = await registerUserCase.execute({ nome, cpf, email, password })

    return await reply.status(201).send(user)
  } catch (err: unknown) {
    if (err instanceof UserAlreadyExistsError) {
      return await reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
