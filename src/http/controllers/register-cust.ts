import { CustomerAlreadyExistsError } from '@/use-cases/errors/customer-already-exists'
import { InvalidCpf } from '@/use-cases/errors/invalid-cpf'
import { makeRegisterCustUseCase } from '@/use-cases/factories/make-register-cust-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'
import { CustomerCnpjAlreadyExistsError } from '@/use-cases/errors/cust-cnpj-already-exists'

export async function registerCust(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const registerBodySchema = z
    .object({
      responsavel: z.string(),
      nome: z.string(),
      telefone: z.string(),
      email: z.string().email(),
      endereco: z.string(),
      cnpj: z.string(),
      password: z.string().optional(),
      services: z.string().array().optional(),
    })
    .parse(request.body)
  const {
    responsavel,
    nome,
    telefone,
    email,
    endereco,
    cnpj: cnpjunflit,
    password,
    services,
  } = registerBodySchema

  try {
    const registerCustomerCase = makeRegisterCustUseCase()
    const cnpj = cnpjunflit.replace(/[^0-9]/g, '')
    const { user } = await registerCustomerCase.execute({
      responsavel,
      nome,
      telefone,
      email,
      endereco,
      cnpj,
      password,
      services,
    })

    return await reply.status(201).send(user)
  } catch (err: unknown) {
    if (err instanceof CustomerAlreadyExistsError) {
      return await reply.status(400).send({ message: err.message })
    }
    if (err instanceof CustomerCnpjAlreadyExistsError) {
      return await reply.status(400).send({ message: err.message })
    }
    if (err instanceof InvalidCpf) {
      return await reply.status(400).send({ message: err.message })
    }
    console.log(err)
    throw err
  }
}
