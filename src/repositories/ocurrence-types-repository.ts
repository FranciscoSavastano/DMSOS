import type { Prisma, Ocurrence_types } from '@prisma/client'

export interface OcurrenceTypesRepository {
  create(data: Prisma.Ocurrence_typesCreateInput): Promise<Ocurrence_types>
  read: (id: number) => Promise<Ocurrence_types | null>
  readAllOcurrenceType: () => Promise<Ocurrence_types[] >
  deleteOcurrenceType: (id: number) => Promise<boolean>
  findById: (id: number) => Promise<Ocurrence_types | null>
}
