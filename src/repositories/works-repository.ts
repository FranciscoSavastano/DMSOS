import type { Prisma, Obra } from '@prisma/client'

export interface IUpdateObra {
  id: string
  //Todos os dados de Obra são opcionais, pois o usuário pode não querer atualizar todos os dados de uma vez
  data: {
    cliente_id?: string
    gerente_id?: string
    nome?: string
    inicio?: Date
    termino?: Date | null
    numproposta?: string
    horas_previstas?: number
    disciplinas?: string[]
  }
}


export interface WorkRepository {
  create: (data: Prisma.ObraCreateInput) => Promise<Obra | null>
  findById: (id: number) => Promise<Obra | null>
  read: (id: number) => Promise<Obra | null>
  readAllWorks: () => Promise<Obra[]>
  update: (data: IUpdateObra) => Promise<Obra | null>
  deleteWork: (id: number) => Promise<boolean>
}
