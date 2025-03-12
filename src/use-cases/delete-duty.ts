import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { UserEmailNotFoundError } from './errors/user-email-not-found-error'
import { DutyIdNotFoundError } from './errors/duty-id-not-found-error'
import { type DutyRepository } from '@/repositories/duties-repository'

interface DeleteDutyUseCaseRequest {
  bearerAuth: string
  id: number
}

export class DeleteDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}

  async execute({
    bearerAuth,
    id,
  }: DeleteDutyUseCaseRequest): Promise<boolean> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const duty = await this.dutyRepository.findById(id)

    if (duty === null) {
      throw new DutyIdNotFoundError()
    }

    return await this.dutyRepository.deleteDuty(duty.id)
  }
}
