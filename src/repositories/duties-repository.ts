import type { Prisma, Plantao, Ocorrencia } from '@prisma/client'
export interface IUpdateDuty {
  id: number
  data: {
    data_inicio?: Date
    data_fim?: Date
    horario_rf?: Date
  }
}

export interface IUpdateOcurrence {
  id: number
  data: {
    duty_id: Number
    descricao?: String
    pm_horario?: Date
    pm_local?: String
    pm_observacao?: String
    pm_acao?: String
  }
}
export interface DutyRepository {
  create: (data: Prisma.PlantaoCreateInput) => Promise<Plantao>
  createOcurrence: (
    data: Prisma.OcorrenciaCreateInput,
  ) => Promise<Ocorrencia | null>
  read: (id: number) => Promise<Plantao | null>
  readAllDuties: () => Promise<Plantao[] | null>
  readAllUserDuties: () => Promise<Plantao[] | null>
  update: (data: IUpdateDuty) => Promise<Plantao | null>
  deleteDuty: (id: number) => Promise<boolean>
  findById: (id: number) => Promise<Plantao | null>
}
