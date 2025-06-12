import { makeCreateActivityWorkDayUseCase } from "@/use-cases/factories/make-create-activity-work-day-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createActivityWorkDay(request: FastifyRequest, reply: FastifyReply) {
  // Ensure multipart is enabled in Fastify
  if (!request.isMultipart()) {
    return reply
      .status(400)
      .send({ error: 'Content-Type must be multipart/form-data' })
  }

  // Parse multipart fields and files
  const parts = await request.parts()
  const fields: Record<string, any> = {}
  const concluidos: string[] = []
  const imagens: any[] = []

  for await (const part of parts) {
    if (part.type === 'file') {
      if (part.fieldname === 'imagens') {
        // You can buffer the file or handle as stream
        const buffers = []
        for await (const chunk of part.file) {
          buffers.push(chunk)
        }
        imagens.push({
          filename: part.filename,
          mimetype: part.mimetype,
          buffer: Buffer.concat(buffers),
        })
      }
    } else {
      // Handle fields
      if (part.fieldname === 'concluidos[]') {
        concluidos.push(part.value)
      } else {
        fields[part.fieldname] = part.value
      }
    }
  }

  // Parse and validate fields
  const schema = z.object({
    activity_id: z.string().transform(Number),
    work_day_id: z.string().transform(Number),
    horas_gastas: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : undefined)),
    interferencias: z.string().optional(),
    checklist_percent: z.string().optional(),
  })

  let parsed
  try {
    parsed = schema.parse(fields)
  } catch (err) {
    return reply.status(400).send({ error: 'Invalid fields', details: err })
  }

  // Authorization header
  const authSchema = z.object({ authorization: z.string() })
  let bearerAuth: string
  try {
    ;({ authorization: bearerAuth } = authSchema.parse(request.headers))
  } catch (err) {
    return reply
      .status(401)
      .send({ error: 'Missing or invalid authorization header' })
  }
  const imagensBytes = imagens.map(img => img.buffer);
  try {
    const createActivityWorkDayUseCase = makeCreateActivityWorkDayUseCase()
    const { activityWorkDay } = await createActivityWorkDayUseCase.execute({
      activity_id: parsed.activity_id,
      work_day_id: parsed.work_day_id,
      concluidos,
      horas_gastas: parsed.horas_gastas,
      interferencias: parsed.interferencias,
      checklist_porcentagem: parsed.checklist_percent,
      imagens : imagensBytes,
      bearerAuth,
    })
    return reply.status(201).send(activityWorkDay)
  } catch (error) {
    console.error(error)
    return reply.status(500).send('Internal Server Error')
  }
}