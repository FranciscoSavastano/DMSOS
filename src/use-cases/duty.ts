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
  descricao: string | null
  pm_horario: Date | null
  pm_local: string | null
  pm_observacao: string | null
  ocurrence_type: string[] | OcorrenciaCreateocurrence_typeInput | undefined
  pm_acao: string | null
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
    })
    for (const ocorrencia of ocurrence) {
      console.log(ocorrencia)
      const newOccurrence = await this.dutyRepository.createOcurrence({
        plantao: {
          connect: {
            id: duty.id,
          },
        },

        descricao: ocorrencia.ocorrencia_desc,
        pm_horario: ocorrencia.ocorrencia_pm_horario,
        pm_local: ocorrencia.ocorrencia_pm_local,
        pm_observacao: ocorrencia.ocorrencia_pm_observacao,
        pm_acao: ocorrencia.ocorrencia_pm_acao,
        ocurrence_type: ocorrencia.ocorrencia_ocurrence_type,
      })

      ocurrences.push(newOccurrence)
    }
    return { duty, ocurrences }
  }
}
