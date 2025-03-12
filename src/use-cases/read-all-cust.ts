import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import type { CustsRepository } from '@/repositories/custs-repository'
import type { Cust } from '@prisma/client'

interface ReadAllCustUseCaseRequest {
  bearerAuth: string
}

interface ReadAllCustUseCaseResponse {
  custs: Cust[]
}

export class ReadAllCustUseCase {
  constructor(private readonly custsRepository: CustsRepository) {}

  async execute({
    bearerAuth,
  }: ReadAllCustUseCaseRequest): Promise<ReadAllCustUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET)
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const custs = await this.custsRepository.readAllCusts()

    return { custs }
  }
}
