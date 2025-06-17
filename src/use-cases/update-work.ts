import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { DutyRepository } from '@/repositories/duties-repository'
import type { Obra, Plantao } from '@prisma/client'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from './errors/user-email-not-found-error'
import { WorkRepository } from '@/repositories/works-repository'

interface UpdateUseCaseRequest {
  bearerAuth: string
  id: number
  data_inicio?: Date
  data_fim?: Date
  termino: Date
}

interface UpdateUseCaseResponse {
  work: Obra
}

export class UpdateWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  async execute({
    bearerAuth,
    id,
    data_inicio,
    data_fim,
    termino
  }: UpdateUseCaseRequest): Promise<UpdateUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const work = await this.workRepository.update({
      id,
      data: {
        termino
        },
    })


    if (work === null) {
      throw new UserEmailNotFoundError()
    }

    return { work }
  }
}
