import { CustomerAlreadyExistsError } from '@/use-cases/errors/customer-already-exists'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists'
import { makeRegisterCustUseCase } from '@/use-cases/factories/make-register-cust-use-case'
import { makeRegisterTecUseCase } from '@/use-cases/factories/make-register-tec-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z
    .object({
      nome: z.string(),
      email: z.string().email(),
      cpf: z.string(),
      password: z.string().min(6),
      user_role: z.string(),
    })
    .parse(request.body)

  const { nome, email, cpf, password, user_role } = registerBodySchema
  if (user_role != 'Cliente') {
    try {
      const registerUserCase = makeRegisterTecUseCase()

      const { user } = await registerUserCase.execute({
        nome,
        cpf,
        email,
        password,
        user_role,
      })

      return await reply.status(201).send(user)
    } catch (err: unknown) {
      if (err instanceof UserAlreadyExistsError) {
        return await reply.status(400).send({ message: err.message })
      }

      throw err
    }
  } else {
    try {
      const cnpj = cpf
      const registerCustomerCase = makeRegisterCustUseCase()

      const { user } = await registerCustomerCase.execute({
        nome,
        cnpj,
        email,
        password,
      })

      return await reply.status(201).send(user)
    } catch (err: unknown) {
      if (err instanceof CustomerAlreadyExistsError) {
        return await reply.status(400).send({ message: err.message })
      }

      throw err
    }
  }
}
