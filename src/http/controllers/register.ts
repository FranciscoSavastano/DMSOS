import { CustomerAlreadyExistsError } from '@/use-cases/errors/customer-already-exists'
import { InvalidCpf } from '@/use-cases/errors/invalid-cpf'
import { UserAlreadyExistsError } from '@/use-cases/errors/user-already-exists'
import { UserCpfAlreadyExistsError } from '@/use-cases/errors/user-cpf-already-exists'
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
      password: z.string().min(6).optional(),
      user_role: z.string(),
      contrato: z.string().optional()
    })
    .parse(request.body)

  const {
    nome,
    email,
    cpf: cpfunflit,
    password,
    user_role,
    contrato,
  } = registerBodySchema
  const cpf = cpfunflit.replace(/[^0-9]/g, '')
  if (user_role != 'Cliente') {
    try {
      const registerUserCase = makeRegisterTecUseCase()
      const { user } = await registerUserCase.execute({
        nome,
        cpf,
        email,
        user_role,
        contrato
      })

      return await reply.status(201).send(user)
    } catch (err: unknown) {
      if (err instanceof UserAlreadyExistsError) {
        return await reply.status(400).send({ message: err.message })
      }
      if (err instanceof UserCpfAlreadyExistsError) {
        return await reply.status(400).send({ message: err.message })
      }
      if (err instanceof InvalidCpf) {
        return await reply.status(400).send({ message: err.message })
      }

      throw err
    }
  } else {
  }
}
