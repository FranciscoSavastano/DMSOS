import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import pdfkit from 'pdfkit-table'
import path from "path";
import sharp from 'sharp';
import fs from 'fs'

export async function createObraPdf(request: FastifyRequest, reply: FastifyReply){
    try {
        const createObraPdfBodySchema = z.object({
            id: z.number(),
            diaObraId: z.number().optional(),
        }).parse(request.body);
        const createObraPdfHeadersSchema = z
            .object({
                authorization: z.string(),
            })
            .parse(request.headers);
        const { authorization: bearerAuth } = createObraPdfHeadersSchema;
        const { id, diaObraId } = createObraPdfBodySchema;
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
    rows: responseData.equipe.map(e => [e.cargo, e.quantidade, e.tempoDiario])
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

doc.moveDown(6);
// Get all dias da obra
const diasObra = diaObraData.data.workDay.workDay;

// Filter for the requested diaObraId, or skip if not provided
const diasSelecionados = diaObraId
  ? diasObra.filter(dia => dia.id === diaObraId)
  : diasObra;

if (diasSelecionados && diasSelecionados.length > 0) {
  for (const dia of diasSelecionados) {
    doc.addPage();
    doc.fontSize(16).text(`Dia da Obra: ${new Date(dia.data).toLocaleDateString()}`, { underline: true });
    doc.fontSize(12).text(`Observação: ${dia.observacao || '-'}`);
    doc.moveDown();

    if (dia.atividadeNaObra && dia.atividadeNaObra.length > 0) {
      for (const atvDia of dia.atividadeNaObra) {
        // Find the atividade details by id
        const atividade = responseData.atividades.find(a => a.id === atvDia.atividade_id);
        if (atividade) {
          doc.fontSize(13).text(`Atividade: ${atividade.nome}`);
          doc.fontSize(11).text(`Descrição: ${atividade.descricao || '-'}`);
        } else {
          doc.fontSize(13).text(`Atividade ID: ${atvDia.atividade_id}`);
        }
        doc.fontSize(11).text(`Concluídos: ${(atvDia.concluidos && atvDia.concluidos.length > 0) ? atvDia.concluidos.join(', ') : '-'}`);
        doc.fontSize(11).text(`Horas gastas: ${atvDia.horas_gastas ?? '-'}`);
        doc.moveDown();
      }
    } else {
      doc.fontSize(12).text('Nenhuma atividade registrada para este dia.');
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
              // Gerando o PDF normalmente com PDFKit
              // (A compressão básica já está habilitada por padrão)
              const writeStream = fs.createWriteStream(filePath);
              doc.pipe(writeStream);
        
              writeStream.on('finish', async () => {
                try {
                  // Comprimindo o PDF gerado com pdf-lib
                  await compressPdfWithPdfLib(filePath);
                  resolve(filePath);
                } catch (err) {
                  console.error("Erro na compressão do PDF:", err);
                  // Retornar o arquivo original caso a compressão falhe
                  resolve(filePath);
                }
              });
        
              writeStream.on('error', (err) => {
                console.error("Error writing PDF:", err);
                reject(err);
              });
        
              doc.on('error', (err) => {
                console.error("Error generating PDF:", err);
                reject(err);
              });
        
              doc.end(); // Finalize the PDF
            } catch (err) {
              console.error("Erro geral:", err);
              reject(err);
            }
          });
        
    }catch (error) {
        console.error('Error creating PDF for obra:', error);
        return reply.code(500).send({
            error: 'Internal Server Error',
            message: 'An error occurred while creating the PDF for the obra',
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