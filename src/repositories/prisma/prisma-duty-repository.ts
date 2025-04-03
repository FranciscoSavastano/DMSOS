import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { DutyRepository, IUpdateDuty } from '../duties-repository'
import { NotFoundError } from '@prisma/client/runtime/library'

export class PrismaDutyRepository implements DutyRepository {
  async create(data: {
    data_inicio: Date;
    data_fim: Date;
    horario_rf: Date;
    contrato: string;
    consideracoes?: string;
    operadorIds: string[]; // Array of User IDs to connect
  }) {
    console.log("operadorIds being passed: ", data.operadorIds);
    const duty = await prisma.plantao.create({
      data: {
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        horario_rf: data.horario_rf,
        contrato: data.contrato,
        consideracoes: data.consideracoes || "",
        // Create the connections in the join table
        operadores: {
          create: data.operadorIds.map(operadorId => ({
            operador: {
              connect: { id: operadorId }
            }
          }))
        }
      },
      // Include the connected operadores in the result
      include: {
        operadores: {
          include: {
            operador: true
          }
        }
      }
    });
  
    return duty;
  }
  async findById(id: number) {
    const duty = await prisma.plantao.findUnique({
      where: {
        id,
      },
      include: {
        operadores: true,
      },
    })
    return duty
  }
  async createOcurrence(data: Prisma.OcorrenciaCreateInput) {
    const ocurrence = await prisma.ocorrencia.create({
      data,
    })
    return ocurrence
  }

  async read(id: number) {
    const duty = await prisma.plantao.findUnique({
      where: {
        id,
      },
      include: {
        operadores: true,
      },
    })
    return duty
  }

  async readAllDuties() {
    const duty = await prisma.plantao.findMany({
      include: {
        operadores: true,
        ocorrencia: true,
      },
    })
    return duty
  }

  async readAllUserDuties(id: string) {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id,
        },
      })

      const plantoes = await prisma.plantao.findMany({
        where: {
          operadoresNome: {
            has: user.nome,
          },
        },
      })

      return plantoes
    } catch (err) {
      if (err instanceof NotFoundError) {
        return err.message
      }
    }
    return null
  }
  async update({ id, data }: IUpdateDuty) {
    const duty = await prisma.plantao.update({
      where: { id },
      data,
      include: {
        operadores: true,
      },
    })
    return duty
  }

  async deleteDuty(id: number) {
    const duty = await prisma.plantao.delete({
      where: {
        id,
      },
      include: {
        operadores: true,
      },
    })
    return true
  }
}
