import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from '../errors/invalid-jwt-token-error'
import type { DutyRepository } from '@/repositories/duties-repository'
import type { Plantao } from '@prisma/client'

interface ReadAllDutyUseCaseRequest {
  bearerAuth: string
  id: string
}

interface ReadAllDutyUseCaseResponse {
  duty: Plantao[]
}

export class ReadAllUserDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}

  async execute({
    bearerAuth,
    id,
  }: ReadAllDutyUseCaseRequest): Promise<ReadAllDutyUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET)
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const duty = await this.dutyRepository.readAllUserDuties(id)

    return { duty }
  }
}
