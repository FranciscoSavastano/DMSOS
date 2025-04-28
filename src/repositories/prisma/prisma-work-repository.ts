import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { WorkRepository, IUpdateWork } from '../work-repository'
import { NotFoundError } from '@prisma/client/runtime/library'

// filepath: c:\Users\franc\Documents\Projetos DMSYS\DMSOS\src\repositories\prisma\prisma-work-repository.ts

export class PrismaWorkRepository implements WorkRepository {
  async create(data: {
    cliente_id: string
    gerente_id: string
    nome: string
    inicio: Date
    termino?: Date
    numproposta: string
    disciplinas: string[]
    horas_previstas: number
    hh_previstas: number
    tipoDias: string
    equipe: {
      cargo: string
      quantidade: number
      tempoDiario: number
    }[]
  }) {
    const work = await prisma.obra.create({
      data: {
        cliente: {
          connect: { id: data.cliente_id },
        },
        gerente: {
          connect: { id: data.gerente_id },
        },
        nome: data.nome,
        inicio: data.inicio,
        termino: data.termino,
        numproposta: data.numproposta,
        disciplinas: data.disciplinas,
        horas_previstas: data.horas_previstas,
        hh_previstas: data.hh_previstas,
        tipoDias: data.tipoDias,
        equipe: data.equipe,
      },
      include: {
        cliente: true,
        gerente: true,
      },
    })

    return work
  }

  async createActivity(
    data: Prisma.AtividadeCreateInput & { work_id: number },
  ) {
    const { work_id, ...rest } = data // Exclude work_id from the data object

    const activity = await prisma.atividade.create({
      data: {
        ...rest, // Spread the remaining fields
        obra: {
          connect: { id: work_id }, // Use work_id only in the connect clause
        },
      },
    })

    return activity
  }

  async read(id: number) {
    const work = await prisma.obra.findUnique({
      where: {
        id,
      },
      include: {
        cliente: true,
        gerente: true,
        dia_obra: true,
        atividades: true,
      },
    })

    return work
  }

  async findById(id: number) {
    const work = await prisma.obra.findUnique({
      where: {
        id,
      },
      include: {
        cliente: true,
        gerente: true,
        dia_obra: true,
        atividades: true,
      },
    })

    return work
  }

  async readAllWorks() {
    const works = await prisma.obra.findMany({
      include: {
        cliente: true,
        gerente: true,
      },
    })

    return works
  }

  async readAllClientWorks(clienteId: string) {
    try {
      const client = await prisma.cliente.findUniqueOrThrow({
        where: {
          id: clienteId,
        },
      })

      const works = await prisma.obra.findMany({
        where: {
          cliente_id: client.id,
        },
        include: {
          gerente: true,
        },
      })

      return works
    } catch (err) {
      if (err instanceof NotFoundError) {
        return err.message
      }
    }
    return null
  }

  async update({ id, data }: IUpdateWork) {
    const work = await prisma.obra.update({
      where: { id },
      data: {
        ...data,
        cliente: data.clienteId
          ? {
              connect: { id: data.clienteId },
            }
          : undefined,
        gerente: data.gerenteId
          ? {
              connect: { id: data.gerenteId },
            }
          : undefined,
      },
      include: {
        cliente: true,
        gerente: true,
      },
    })

    return work
  }

  async deleteWork(id: number) {
    await prisma.obra.delete({
      where: {
        id,
      },
    })

    return true
  }
}