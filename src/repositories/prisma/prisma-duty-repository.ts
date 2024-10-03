import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { DutyRepository } from '../duties-repository'

export class PrismaDutyRepository implements DutyRepository {
  async create(data: Prisma.PlantaoCreateInput) {
    const duty = await prisma.plantao.create({
      data,
    })

    return duty
  }
  async createOcurrence(data: Prisma.OcorrenciaCreateInput) {
    const ocurrence = await prisma.ocorrencia.create({
      data,
    })

    return ocurrence
  }
}
