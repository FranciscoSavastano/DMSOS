import type { WorkRepository } from '@/repositories/works-repository'
import type { Obra} from '@prisma/client'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'
import { UnknownProposalNumberError } from './errors/unknown-proposal'

interface RegisterUseCaseRequest {
  cliente_id: string
  gerente_id: string
  nome: string
  inicio: Date
  termino?: Date | null
  numproposta: string
  horas_previstas: number
  hh_previstas: number
  disciplinas: string[]
  equipe: string[]
  tipoDias: string
  bearerAuth: string
}

interface RegisterUseCaseResponse {
  work: Obra
}

export class CreateWorkUseCase {
  constructor(private readonly workRepository: WorkRepository) {}
  
  async execute({
    cliente_id,
    gerente_id,
    nome,
    inicio,
    termino,
    numproposta,
    horas_previstas,
    hh_previstas,
    disciplinas,
    equipe,
    tipoDias,
    bearerAuth,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    try {
      verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }
    //Verificar se numero da proposta segue o padrao PR ## - ##[A-Z], exemplo PR 99 - 12B
    //Desabilitado devido a pedido do cliente para aceitar qualquer numero de proposta
    //const regex = /^PR\s?\d{2}\s?-\s?\d{2}[A-Z]?$/
    //if (!regex.test(numproposta)) {
    //  throw new UnknownProposalNumberError();
    //}
    const work = await this.workRepository.create({
      cliente_id,
      gerente_id,
      nome,
      inicio,
      termino,
      numproposta,
      horas_previstas,
      hh_previstas,
      equipe,
      tipoDias,
      disciplinas,
    });
    
    
    return { work }
  }
}
