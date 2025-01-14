import type { DutyRepository } from '@/repositories/duties-repository'
import type { Cliente, Ocorrencia, Plantao } from '@prisma/client'

interface RegisterUseCaseRequest {
  operador: string
  operadoresNome: string[]
  data_inicio: string
  data_fim: string
  horario_rf: string
  contrato: string
  imagens: unknown
  ocurrence: Ocorrencia[]
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
    operador,
    operadoresNome,
    data_inicio,
    data_fim,
    horario_rf,
    contrato,
    ocurrence,
    consideracoes,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const ocurrences = []
    const duty = await this.dutyRepository.create({
      operadores: {
        connect: {
          id: operador,
        },
      },
      operadoresNome,
      data_inicio,
      data_fim,
      horario_rf,
      contrato,
      consideracoes,
    })
    for (const ocorrencia of ocurrence) {
      console.log(ocorrencia.data)
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
