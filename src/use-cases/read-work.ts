import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { WorkRepository } from '@/repositories/works-repository'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import type { Obra } from '@prisma/client'
import { WorkIdNotFoundError } from './errors/work-id-not-found-error'

interface ReadWorkUseCaseRequest {
  bearerAuth: string
  id: number
}

interface ReadWorkUseCaseResponse {
  work: Obra
}

export class ReadWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  async execute({
    bearerAuth,
    id,
  }: ReadWorkUseCaseRequest): Promise<ReadWorkUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const work = await this.workRepository.read(id)

    if (work === null) {
      throw new WorkIdNotFoundError()
    }

    return { work }
  }
}
