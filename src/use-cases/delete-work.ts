import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { WorkIdNotFoundError } from './errors/work-id-not-found-error'
import { type WorkRepository } from '@/repositories/works-repository'

interface DeleteWorkUseCaseRequest {
  bearerAuth: string
  id: number
}

export class DeleteWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}

  async execute({
    bearerAuth,
    id,
  }: DeleteWorkUseCaseRequest): Promise<boolean> {
    const token = bearerAuth.split(' ')[1]
    let token_payload: { sub: string }

    try {
      token_payload = verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }

    const work = await this.workRepository.findById(id)

    if (work === null) {
      throw new WorkIdNotFoundError()
    }

    return await this.workRepository.deleteWork(work.id)
  }
}
