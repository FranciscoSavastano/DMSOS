import type { DutyRepository } from '@/repositories/duties-repository'
import type { Cliente, Ocorrencia, Plantao } from '@prisma/client'

interface RegisterUseCaseRequest {
  operador: string
  data_inicio: string
  data_fim: string
  horario_rf: string
  ocorrencia_desc?: string
  ocorrencia_pm_horario?: string
  ocorrencia_pm_local?: string
  ocorrencia_pm_observacao?: string
  ocorrencia_pm_acao?: string
}

interface RegisterUseCaseResponse {
  duty: Plantao
  ocurrence: Ocorrencia
}

export class CreateDutyUseCase {
  constructor(private readonly dutyRepository: DutyRepository) {}

  async execute({
    operador,
    data_inicio,
    data_fim,
    horario_rf,
    ocorrencia_desc,
    ocorrencia_pm_horario,
    ocorrencia_pm_local,
    ocorrencia_pm_observacao,
    ocorrencia_pm_acao,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const duty = await this.dutyRepository.create({
      operador: {
        connect: {
          id: operador,
        },
      },
      data_inicio,
      data_fim,
      horario_rf,
    })

    const ocurrence = await this.dutyRepository.createOcurrence({
      plantao: {
        connect: {
          id: duty.id,
        },
      },
      descricao: ocorrencia_desc,
      pm_horario: ocorrencia_pm_horario,
      pm_local: ocorrencia_pm_local,
      pm_observacao: ocorrencia_pm_observacao,
      pm_acao: ocorrencia_pm_acao,
    })
    console.log('ok')
    return {
      duty,
      ocurrence,
    }
  }
}
