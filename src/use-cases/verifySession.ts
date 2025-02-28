import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { type DutyRepository } from '@/repositories/duties-repository'

interface VerifySessionUseCaseRequest {
  bearerAuth: string
}

export class VerifySessionUseCase {
  async execute({ bearerAuth }: VerifySessionUseCaseRequest): Promise<any> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
      return token_payload
    } catch (error) {
      throw new InvalidJwtTokenError()
    }
  }
}
