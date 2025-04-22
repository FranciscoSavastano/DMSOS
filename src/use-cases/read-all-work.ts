import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import type { WorkRepository } from '@/repositories/works-repository'
import type { Obra } from '@prisma/client'

interface ReadAllWorkUseCaseRequest {
  bearerAuth: string
}

interface ReadAllWorkUseCaseResponse {
  works: Obra[]
}

export class ReadAllWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  async execute({
    bearerAuth,
  }: ReadAllWorkUseCaseRequest): Promise<ReadAllWorkUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]

    try {
      verify(token, env.JWT_SECRET)
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const works = await this.workRepository.readAllWorks()

    return { works }
  }
}
