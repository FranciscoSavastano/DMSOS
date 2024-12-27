import { CustomerAlreadyExistsError } from '@/use-cases/errors/customer-already-exists'
import { InvalidCpf } from '@/use-cases/errors/invalid-cpf'
import { CustAlreadyExistsError } from '@/use-cases/errors/cust-already-exists'
import { CustCpfAlreadyExistsError } from '@/use-cases/errors/cust-cpf-already-exists'
import { makeRegisterCustUseCase } from '@/use-cases/factories/make-register-cust-use-case'
import { makeRegisterTecUseCase } from '@/use-cases/factories/make-register-tec-use-case'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

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
      password: z.string().min(6),
      cust_role: z.string(),
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
    cust_role,
  } = registerBodySchema

  try {
    const registerCustomerCase = makeRegisterCustUseCase()
    const cnpj = cnpjunflit.replace(/[^0-9]/g, '')
    const { cust } = await registerCustomerCase.execute({
      responsavel,
      nome,
      telefone,
      email,
      endereco,
      cnpj,
      password,
    })

    return await reply.status(201).send(cust)
  } catch (err: unknown) {
    if (err instanceof CustomerAlreadyExistsError) {
      return await reply.status(400).send({ message: err.message })
    }

    throw err
  }
}
