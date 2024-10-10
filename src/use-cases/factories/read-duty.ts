import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { DutyRepository } from '@/repositories/duties-repository'
import { InvalidJwtTokenError } from '../errors/invalid-jwt-token-error'
import type { Plantao } from '@prisma/client'
import { DutyIdNotFoundError } from '../errors/duty-id-not-found-error'

interface ReadDutyUseCaseRequest {
  bearerAuth: string
  id: number
}

interface ReadDutyUseCaseResponse {
  duty: Plantao
}

export class ReadDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}

  async execute({
    bearerAuth,
    id,
  }: ReadDutyUseCaseRequest): Promise<ReadDutyUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const duty = await this.dutyRepository.read(id)

    if (duty === null) {
      throw new DutyIdNotFoundError()
    }

    return { duty }
  }
}
