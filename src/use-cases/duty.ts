import type { DutyRepository } from '@/repositories/duties-repository'
import type { Cliente, Ocorrencia, Plantao } from '@prisma/client'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'
import { InvalidJwtTokenError } from './errors/invalid-jwt-token-error'

interface RegisterUseCaseRequest {
  operadoresNomes: string[]
  data_inicio: string
  data_fim: string
  horario_rf: string
  contrato: string
  imagens: unknown
  ocurrence: Ocorrencia[]
  informacoes_adicionais: string[]
  consideracoes: string
  bearerAuth: string
  operadorIds: string[]
}
interface Ocorrencia {
  data: Date | null
  descricao: string | null
  horario: Date | null
  termino: Date | null
  local: string | null
  responsavel: string | null
  observacao: string | null
  ocurrence_type: string[] | OcorrenciaCreateocurrence_typeInput | undefined
  acao: string | null
}
interface RegisterUseCaseResponse {
  duty: Plantao
  ocurrences: Ocorrencia[]
}

export class CreateDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}
 
  async execute({
    operadoresNomes,
    data_inicio,
    data_fim,
    horario_rf,
    contrato,
    ocurrence,
    consideracoes,
    informacoes_adicionais,
    bearerAuth,
    operadorIds
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const token = bearerAuth.split(' ')[1]
    try {
      verify(token, env.JWT_SECRET) as { sub: string }
    } catch (error) {
      throw new InvalidJwtTokenError()
    }
    const ocurrences = []
    const operadoresNomeFilter: string[] = []
    operadoresNomes.forEach((operador) => {
      if (operador != '') {
        operadoresNomeFilter.push(operador)
      }
    })
    const duty = await this.dutyRepository.create({
      data_inicio,
      data_fim,
      horario_rf,
      contrato,
      consideracoes,
      informacoes_adicionais,
      operadoresNomes,
      operadorIds: operadorIds // Pass the array of IDs with the matching property name
    });
  
    for (const ocorrencia of ocurrence) {
      const newOccurrence = await this.dutyRepository.createOcurrence({
        plantao: {
          connect: {
            id: duty.id,
          },
        },
        
        descricao: ocorrencia.ocorrencia_desc,
        horario: ocorrencia.ocorrencia_horario,
        termino: ocorrencia.ocorrencia_termino,
        local: ocorrencia.ocorrencia_local,
        responsavel: ocorrencia.ocorrencia_responsavel,
        observacao: ocorrencia.ocorrencia_observacao,
        acao: ocorrencia.ocorrencia_acao,
        ocurrence_type: ocorrencia.ocorrencia_tipo,
        data: ocorrencia.data,
      })

      ocurrences.push(newOccurrence)
    }
    return { duty, ocurrences }
  }
}
