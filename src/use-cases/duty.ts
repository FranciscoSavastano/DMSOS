import type { DutyRepository } from '@/repositories/duties-repository'
import type { Cliente, Ocorrencia, Plantao } from '@prisma/client'

interface RegisterUseCaseRequest {
  operadores: string[]
  data_inicio: string
  data_fim: string
  horario_rf: string
  ocorrencias: {
    ocorrencia_desc?: string;
    ocorrencia_pm_horario?: string;
    ocorrencia_pm_local?: string;
    ocorrencia_pm_observacao?: string;
    ocorrencia_pm_acao?: string;
  }[]
}

interface RegisterUseCaseResponse {
  duties: Plantao[]
  ocurrences: Ocorrencia[]
}

export class CreateDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}
  
  async execute({
    operadores,
    data_inicio,
    data_fim,
    horario_rf,
    ocorrencias,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const duties = []
    const ocurrences = []

    for (const operador of operadores) {
      const duty = await this.dutyRepository.create({
        operadores: {
          connect: {
            id: operador,
          },
        },
        data_inicio,
        data_fim,
        horario_rf,
      })

      for (const ocorrencia of ocorrencias) {
        const ocurrence = await this.dutyRepository.createOcurrence({
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
        })
        ocurrences.push(ocurrence)
      }

      duties.push(duty)
    }

    return {
      duties,
      ocurrences,
    }
  }
}
