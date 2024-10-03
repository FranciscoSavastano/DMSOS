import type { Prisma, Plantao, Ocorrencia } from '@prisma/client'

export interface DutyRepository {
  create: (data: Prisma.PlantaoCreateInput) => Promise<Plantao>
  createOcurrence: (data: Prisma.OcorrenciaCreateInput) => Promise<Ocorrencia>
}
