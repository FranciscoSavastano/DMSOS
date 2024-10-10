import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import type { DutyRepository } from '@/repositories/duties-repository'
import type { Plantao } from '@prisma/client'
import { InvalidJwtTokenError } from '../errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from '../errors/user-email-not-found-error'

interface UpdateUseCaseRequest {
  bearerAuth: string
  id: number
  data_inicio?: Date
  data_fim?: Date
  horario_rf?: Date
}

interface UpdateUseCaseResponse {
  duty: Plantao
}

export class UpdateDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}

  async execute({
    bearerAuth,
    id,
    data_inicio,
    data_fim,
    horario_rf,

  }: UpdateUseCaseRequest): Promise<UpdateUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const duty = await this.dutyRepository.update({
      id,
      data: {
        data_inicio,
        data_fim,
        horario_rf,
      },
    })

    if (duty === null) {
      throw new UserEmailNotFoundError()
    }

    return {duty}
  }
}
