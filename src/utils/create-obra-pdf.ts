import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import pdfkit from 'pdfkit-table'
import path from "path";
import sharp from 'sharp';
import fs from 'fs'
const watermarkPath = path.join('./src/utils/pdf-img/logo.png'); // Adjust path as needed

export async function createObraPdf(request: FastifyRequest, reply: FastifyReply){
    try {
        const createObraPdfBodySchema = z.object({
            id: z.number(),
            diaObraId: z.number().optional(),
            assinatura: z.boolean().optional(),
        }).parse(request.body);
        const createObraPdfHeadersSchema = z
            .object({
                authorization: z.string(),
            })
            .parse(request.headers);
        const { authorization: bearerAuth } = createObraPdfHeadersSchema;
        const { id, diaObraId, assinatura } = createObraPdfBodySchema;
        //Get information about the obra
        const obraResponse = axios.post('http://127.0.0.1:3333/v1/obra/read', {
            id: id,
        }, {
            headers: {
                Authorization: bearerAuth,
            },
        });
        const diaObraResponse = axios.post('http://127.0.0.1:3333/v1/obra/dia/readAllWorkDaysByWID', {
            id: id,
        }, {
            headers: {
                Authorization: bearerAuth,
            },
        });
        const diaObraData = await diaObraResponse;
        const obra = await obraResponse;
        if (!obra) {
            return reply.code(404).send({
                error: 'Not Found',
                message: 'Obra not found',
            });
        }
        const responseData = obra.data.work.work;
        console.log('Obra data:', responseData);
        console.log('Dia Obra data:', diaObraData.data.workDay.workDay);
    //Crie o PDF com os dados da obra
        const doc = new pdfkit();
//For each page, set a background image company logo
doc.fontSize(25).text('Relatório Diario de Obra', { align: 'center' });
// Add a horizontal line
doc.moveTo(50, 100)
   .lineTo(550, 100)
   .stroke()
// Verical line
doc.moveTo(300, 280)
   .lineTo(300, 100)
   .stroke();
// Closing horizontal line
doc.moveTo(50, 160)
   .lineTo(550, 160)
   .stroke();
// Observação horizontal line
doc.moveTo(50, 280)
   .lineTo(550, 280)
   .stroke();
doc.moveDown();
doc.fontSize(14).text('Responsável da Obra', 60, 110, { underline: true, width: 220 });
doc.fontSize(12).text(`Nome: ${responseData.gerente?.nome || '-'}`, 60, 130, { width: 220 });

// Projeto (right side)
doc.fontSize(14).text(`Projeto: ${responseData.nome}`, 320, 110, { align: 'left', width: 220 });
doc.fontSize(12).text(`Cliente: ${responseData.cliente?.nome || '-'}`, 320, 125, { width: 220 });
doc.fontSize(12).text(`Número da Proposta: ${responseData.numproposta || '-'}`, 320, 140, { width: 220 });
doc.moveDown();

doc.fontSize(14).text('Equipe', 60, 170, { underline: true });

doc.moveDown(0.5);
if (responseData.equipe && responseData.equipe.length > 0) {
  const equipeTable = {
    headers: ['Cargo', 'Quantidade', 'Tempo Diário'],
    rows: responseData.equipe.map(e => [e.cargo, e.quantidade, e.tempoDiario + " horas"]),
  };
  await doc.table(equipeTable, { width: 200 });
} else {
  doc.fontSize(12).text('Nenhuma equipe cadastrada.');
}
//Use the diaObraId 
const diaObra = diaObraId ? responseData.dia_obra.find(d => d.id === diaObraId) : null;
if (diaObra) {
    doc.fontSize(14).text(`Data: ${new Date(diaObra.data).toLocaleDateString()}`, 320, 170, { align: 'left', width: 220 });
    doc.fontSize(14).text(`Inicio: ${new Date(diaObra.inicio).toLocaleTimeString()}`, 320, 190, { align: 'left', width: 220 });
    doc.fontSize(14).text(`Termino: ${new Date(diaObra.termino).toLocaleTimeString()}`, 320, 210, { align: 'left', width: 220 });
}else {
    doc.fontSize(14).text(`Sem informações da obra`, 320, 170, { align: 'left', width: 220 });
}

// Get all dias da obra
const diasObra = diaObraData.data.workDay.workDay;

// Filter for the requested diaObraId, or skip if not provided
const diasSelecionados = diaObraId
  ? diasObra.filter(dia => dia.id === diaObraId)
  : diasObra;
let first = true;
if (diasSelecionados && diasSelecionados.length > 0) {
  for (const dia of diasSelecionados) {
    if (dia.atividadeNaObra && dia.atividadeNaObra.length > 0) {
      for (const atvDia of dia.atividadeNaObra) {
        // Find the atividade details by id
        const atividade = responseData.atividades.find(a => a.id === atvDia.atividade_id);
        if (atividade) {
          if(first) {
            doc.fontSize(13).text(`Atividade: ${atividade.nome}`, 60, 290);
            first = false;
        } else {
            //Check if is near the end of the page
            console.log('Current Y position:', doc.y);
            if (doc.y > 700) {
              doc.addPage();
            }
            doc.moveTo(50, doc.y + 10)
            .lineTo(550, doc.y + 10)
            .stroke();
            doc.fontSize(13).text(`Atividade: ${atividade.nome}`, 60, doc.y + 20);
          }
           doc.fontSize(11).text(`Descrição: ${atividade.descricao || '-'}`, 60, doc.y + 10);
        } else {
          doc.fontSize(13).text(`Atividade ID: ${atvDia.atividade_id}`, 60, 310);
          doc.fontSize(11).text('Descrição: Atividade não encontrada', 60, doc.y + 10);
        }
        //Check if is near the end of the page
        if (doc.y > 700) {
          doc.addPage();
        }
        doc.fontSize(11).text(`Checklist concluidas: ${(atvDia.concluidos && atvDia.concluidos.length > 0) ? atvDia.concluidos.join(', ') : '-'}`, 60, doc.y + 10);
        doc.fontSize(11).text(`Interferencias: ${atvDia.interferencias ?? '-'}`, 60, doc.y + 10);
        if (atvDia.imagens && atvDia.imagens.length > 0) {
        doc.fontSize(11).text(`Anexos:`, 60, doc.y + 10);
        //Images

  const imageWidth = 80;   // Adjust as needed
  const imageHeight = 60;  // Adjust as needed
  let imgX = 60;           // Starting x position
  const imgY = doc.y + 10; // y position below the last text

for (const img of atvDia.imagens) {
   try {
    const buffer = Buffer.isBuffer(img) ? img : Buffer.from(img.data);
    doc.image(buffer, imgX, imgY, { width: imageWidth, height: imageHeight });
    imgX += imageWidth + 10;
   } catch (err) {
      console.error('Erro ao inserir imagem:', err);
    }
  }
  // Move the cursor below the images for the next content
  doc.y = imgY + imageHeight + 10;
  // Porcentagem do checklist
  // Porcentagem do checklist (Progress Bar)
const percentStr = atvDia.checklist_porcentagem ?? "0";
const percent = Math.max(0, Math.min(100, parseInt(percentStr, 10) || 0)); // Clamp between 0 and 100

const barX = 60;
const barY = doc.y + 10;
const barWidth = 200;
const barHeight = 18;
const radius = 8;

// Draw background bar
doc.save()
  .roundedRect(barX, barY, barWidth, barHeight, radius)
  .fill('#e0e0e0');

// Draw filled bar (progress)
const fillWidth = (barWidth * percent) / 100;
doc
  .roundedRect(barX, barY, fillWidth, barHeight, radius)
  .fill('#4caf50');

// Draw percentage text centered in the bar
doc
  .fillColor('#000')
  .fontSize(11)
  .text(`${percent}%`, barX, barY + 2, {
    width: barWidth,
    align: 'center',
    height: barHeight,
    valign: 'center'
  });

doc.restore();

// Move cursor below the bar for next content
doc.y = barY + barHeight + 10;
}
      }
    } else {
      doc.fontSize(12).text('Nenhuma atividade registrada para este dia.', 60, 310);
    }
    doc.moveDown(2);
  }
} else {
  doc.fontSize(12).text('Nenhum dia de obra encontrado para o filtro.');
}
          const gendocsPath = path.join(__dirname, '/', 'gendocs', '/', 'obra');
          
          if (!fs.existsSync(gendocsPath)) {
            fs.mkdirSync(gendocsPath, { recursive: true })
          }
          
          // Nome do arquivo
          const filePath = `${gendocsPath}/Obra ${responseData.id}.pdf`

      return new Promise(async (resolve, reject) => {
        try {
          // Criar buffer em memória em vez de arquivo no disco
          const chunks: Buffer[] = [];
          const writeStream = new require('stream').Writable({
            write(chunk: Buffer, encoding: string, callback: () => void) {
              chunks.push(chunk);
              callback();
            }
          });

          doc.pipe(writeStream);

          writeStream.on('finish', async () => {
            try {
              // Concatenar chunks em um único buffer
              const pdfBuffer = Buffer.concat(chunks);

              // Comprimir o PDF
              const compressedBuffer = await compressPdfWithMemoryBuffer(pdfBuffer);

              // Enviar como resposta HTTP
              reply
                .header('Content-Type', 'application/pdf')
                .header('Content-Disposition', `attachment; filename="Obra ${responseData.id}.pdf"`)
                .send(compressedBuffer);

              resolve();
            } catch (err) {
              console.error("Erro na compressão do PDF:", err);
              reject(err);
            }
          });

          doc.end(); // Finaliza o PDF
        } catch (err) {
          console.error("Erro geral:", err);
          reject(err);
        }
      });

    } catch (error) {
      console.error('Error creating PDF for obra:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while creating the PDF for the obra',
      });
    }
  async function compressPdfWithMemoryBuffer(pdfBuffer: Buffer): Promise<Buffer> {
    const { PDFDocument } = require('pdf-lib');

    // Carregar o documento a partir do buffer
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    // Comprimir e retornar o PDF como buffer
    return await pdfDoc.save({
      addDefaultPage: false,
      useObjectStreams: true,  // Ajuda na compressão
    });
  }

  async function compressPdfWithPdfLib(filePath) {
  const { PDFDocument } = require('pdf-lib');
  const fs = require('fs');
  
  // Ler o arquivo PDF original
  const pdfBytes = fs.readFileSync(filePath);
  
  // Carregar o documento
  const pdfDoc = await PDFDocument.load(pdfBytes, {
    // Opções para ignorar falhas de validação de PDF
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Comprimir e salvar o PDF
  // A compressão é feita automaticamente pelo pdf-lib
  const compressedBytes = await pdfDoc.save({
    addDefaultPage: false,
    useObjectStreams: true,  // Ajuda na compressão
  });
  
  // Salvar o PDF comprimido no mesmo arquivo
  fs.writeFileSync(filePath, compressedBytes);
  
  console.log(`PDF comprimido salvo em ${filePath}`);
  
  return filePath;
}
}