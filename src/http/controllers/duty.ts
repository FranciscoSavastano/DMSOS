import { makeCreateDutyUseCase } from '@/use-cases/factories/make-create-duty-use-case'
import { WriteImages } from '@/use-cases/write-images'
import { CreatePdf } from '@/utils/create-pdf'
import multer from 'multer'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { string, z } from 'zod'
import moment from 'moment'
import { sendEmail } from '@/utils/send-email'

export async function createDuty(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    operadoresNomes: z.string().array(),
    data_inicio: z.string().datetime(),
    data_fim: z.string().datetime(),
    contrato: z.string().min(1),
    consideracoes: z.string(),
    horario_rf: z.string().datetime(),
    imagens: z.any(),
    ocurrence: z.array(z.object({
      ocorrencia_desc: z.string().optional().default(''),
      ocorrencia_horario: z.string().datetime().optional(),
      ocorrencia_termino: z.string().datetime().optional(),
      ocorrencia_local: z.string().optional(),
      ocorrencia_responsavel: z.string().optional(),
      ocorrencia_observacao: z.string().optional(),
      ocorrencia_acao: z.string().optional(),
      ocorrencia_tipo: z.string().optional(),
      ocorrencia_data: z.string().datetime().optional(),
    })).optional(),
    informacoes_adicionais: z.any().optional(),
    operadorIds: z.array(z.string()),
  }).parse(request.body);

  const { authorization: bearerAuth } = z.object({
    authorization: z.string(),
  }).parse(request.headers);

  const {
    operadoresNomes,
    data_inicio,
    data_fim,
    contrato,
    horario_rf,
    ocurrence,
    consideracoes,
    informacoes_adicionais,
    operadorIds,
  } = registerBodySchema;

  try {
    const registerDutyCase = makeCreateDutyUseCase();
    const { duty, ocurrences } = await registerDutyCase.execute({
      operadoresNomes,
      data_inicio,
      data_fim,
      contrato,
      horario_rf,
      ocurrence,
      consideracoes,
      informacoes_adicionais,
      bearerAuth,
      operadorIds,
    });
    console.log("Duty created successfully Sending to pdf...");
    const pdfBuffer = await CreatePdf(duty, bearerAuth);
    console.log('PDF created successfully!');
    // Send email with the PDF buffer
    const emailto = "francisco.pereira@dmsys.com.br";
    const subject = `Relatório Diário ${contrato}`;
    const message = `Relatório do contrato ${contrato} na data de ${moment(data_inicio).format('DD/MM/YYYY')}`;
    console.log('PDF created successfully at:', pdfBuffer);

    // Send email with the PDF attachment
    await sendEmail({
      to: emailto,
      subject,
      message,
      attachments: [
        {
          filename: `Relatorio_${contrato}_${duty.id}.pdf`,
          path: pdfBuffer, // Attach the file directly from the path
          contentType: 'application/pdf',
        },
      ],
    });
    console.log('Email sent successfully!');
    return reply.status(201).send({ duty, ocurrences });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ message: 'Internal server error' });
  }
}