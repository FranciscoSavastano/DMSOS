import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { DutyRepository, IUpdateDuty } from '../duties-repository'
import { NotFoundError } from '@prisma/client/runtime/library'
import { string } from 'zod';
interface RevisaoData {
  plantao_id: number;
  usertype: string;
  userid: string;
  nomeSolicitante: string;
  solicitacao: string;
}

export class PrismaDutyRepository implements DutyRepository {
  async create(data: {
    data_inicio: Date;
    data_fim: Date;
    horario_rf: Date;
    contrato: string;
    consideracoes?: string;
    operadoresNomes: string[]
    operadorIds: string[]; // Array of User IDs to connect
  }) {
    const duty = await prisma.plantao.create({
      data: {
        operadoresNomes: data.operadoresNomes,
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

  async createRevisao(data: Prisma.RevisaoCreateInput) {
    // Extract usertype and userid from data, but don't include them directly in the database record
    const { usertype, userid, ...revisaoData } = data;
    
    // Create the base revisao object with the required fields
    const createData = {
      plantao: {
        connect: { id: data.plantao_id }
      },
      nomeSolicitante: data.nomeSolicitante,
      solicitacao: data.solicitacao
    };
    
    // Based on usertype, connect to either cliente or user
    if (usertype === 'Cliente' && userid) {
      createData.cliente = {
        connect: { id: userid }
      };
    } else if (userid) {
      createData.user = {
        connect: { id: userid }
      };
    }
    
    // Create the revisao record
    const revisao = await prisma.revisao.create({
      data: createData
    });
    
    return revisao;
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
          operadoresNomes: {
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
