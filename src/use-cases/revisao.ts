import type { DutyRepository } from '@/repositories/duties-repository'
import type { Revisao } from '@prisma/client'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'

interface RegisterUseCaseRequest {
  plantao: number,
  userid: string,
  nome: string,
  texto: string,
  usertype: string,
  bearerAuth: string,
}

interface RegisterUseCaseResponse {
  revisao: Revisao
}

export class CreateRevisaoUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}
 
  async execute({
    plantao,
    userid,
    nome,
    texto,
    usertype,
    bearerAuth,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    try {
      verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }
    const revisao = await this.dutyRepository.createRevisao({
      plantao_id : plantao,
      usertype,
      userid,
      nomeSolicitante : nome,
      solicitacao : texto,
    });
    console.log(revisao)
    return { revisao }
  }
}
