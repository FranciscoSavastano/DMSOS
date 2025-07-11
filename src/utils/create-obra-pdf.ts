import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import pdfkit from 'pdfkit-table'
import path from "path";
import sharp from 'sharp';
import fs from 'fs'
const watermarkPath = path.join('./src/utils/pdf-img/logo.png'); // Adjust path as needed

export async function createObraPdf(request: FastifyRequest, reply: FastifyReply) {
  try {
    const createObraPdfBodySchema = z.object({
      id: z.number(),
      diaObraId: z.number().optional(),
      assinatura: z.boolean().optional(),
      emails: z.string().array().optional(),
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
    const usuarios = axios.get('http://127.0.0.1:3333/v1/users/readUserByContract/Implantação', {
      headers: {
        Authorization: bearerAuth,
      }
    });
    const usuariosData = await usuarios;
    console.log('Usuarios Data:', usuariosData.data);
    if (!usuariosData) {

      return reply.code(404).send({
        error: 'Not Found',
        message: 'No users found for the specified contract',
      });
    }
    let usuariosArray = [];
    for (const user of usuariosData.data){
      console.log(`User ID: ${user.id}, Name: ${user.nome}`);
    }
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
    console.log('Equipe:', responseData.equipe);

    doc.moveDown(0.5);
    if (responseData.equipe && responseData.equipe.length > 0 && usuariosData.data && Array.isArray(usuariosData.data)) {
      // Filtra os usuários que estão na equipe
      console.log(responseData.equipe[0]);
      if(typeof responseData.equipe === 'string') {
        const equipe = JSON.parse(responseData.equipe);
        console.log('Equipe:', equipe);
      }

    } else {
      doc.fontSize(12).text('Nenhuma equipe cadastrada.');
    }
//Use the diaObraId 
    const diaObra = diaObraId ? responseData.dia_obra.find(d => d.id === diaObraId) : null;
    if (diaObra) {
      doc.fontSize(14).text(`Data: ${new Date(diaObra.data).toLocaleDateString()}`, 320, 170, {
        align: 'left',
        width: 220
      });
      doc.fontSize(14).text(`Inicio: ${new Date(diaObra.inicio).toLocaleTimeString()}`, 320, 190, {
        align: 'left',
        width: 220
      });
      doc.fontSize(14).text(`Termino: ${new Date(diaObra.termino).toLocaleTimeString()}`, 320, 210, {
        align: 'left',
        width: 220
      });
    } else {
      doc.fontSize(14).text(`Sem informações da obra`, 320, 170, { align: 'left', width: 220 });
    }

// Get all dias da obra
    const diasObra = diaObraData.data.workDay.workDay;
    doc.moveDown(0.5);
    if (responseData.equipe && responseData.equipe.length > 0 && usuariosData.data && Array.isArray(usuariosData.data)) {
      // Filtra os usuários que estão na equipe
      const equipeUsuarios = usuariosData.data.filter((user: any) =>
        responseData.equipe.includes(user.id)
      );
      const equipeTable = {
        headers: ['Nome', 'Cargo'],
        rows: equipeUsuarios.map((u: any) => [u.nome, u.user_role]),
      };
      await doc.table(equipeTable, {
        width: 247,
        x: 53,
        y: 170,
        columnSize: [190, 30] // 80% e 20% da largura total
      });
    } else {
      doc.fontSize(12).text('Nenhuma equipe cadastrada.');
    }
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
              if (first) {
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
              doc.moveDown(1)
              doc.fontSize(11).text("Equipe na Atividade:")
              doc.moveDown(0.5);
              const equipeMap = new Map<string, { nome: string, cargo: string, horas: number }>();

              for (const equipeStr of atvDia.equipe || []) {
                console.log('equipe: ', atvDia.equipe);
                let equipeObj;
                try {
                  equipeObj = typeof equipeStr === 'string' ? JSON.parse(equipeStr) : equipeStr;
                } catch {
                  continue;
                }
                // Só considera membros da atividade atual
                console.log('Equipe Object:', equipeObj);
                if (equipeObj.atividade_id !== atvDia.atividade_id) continue;

                // Extrai nome e cargo
                const match = equipeObj.nome.match(/^(.+?)\s*\((.+)\)$/);
                const nome = match ? match[1].trim() : equipeObj.nome;
                const cargo = match ? match[2].trim() : '-';
                const horas = Number(equipeObj.horas) || 0;

                const key = `${nome}_${equipeObj.atividade_id}`;
                if (equipeMap.has(key)) {
                  equipeMap.get(key)!.horas += horas;
                } else {
                  equipeMap.set(key, { nome, cargo, horas });
                }
              }

              const equipeRows = Array.from(equipeMap.values()).map(e =>
                [e.nome, e.cargo, `Horas: ${e.horas}`]
              );

              if (equipeRows.length > 0) {
                const equipeTable = {
                  headers: ['Nome', 'Cargo', 'Horas'],
                  rows: equipeRows,
                };
                await doc.table(equipeTable, { width: 300 });
              } else {
                doc.fontSize(12).text('Nenhuma equipe registrada para esta atividade.');
              }

            } else {
              doc.fontSize(13).text(`Atividade ID: ${atvDia.atividade_id}`, 60, 310);
              doc.fontSize(11).text('Descrição: Atividade não encontrada', 60, doc.y + 10);
            }
            //Check if is near the end of the page
            if (doc.y > 700) {
              doc.addPage();
            }
            if (atvDia.concluidos && atvDia.concluidos.length > 0) {
              doc.fontSize(11).text('Checklist concluídos:', 60);
              for (let item of atvDia.concluidos) {
                if (typeof item === 'string') {
                  try {
                    item = JSON.parse(item);
                  } catch {
                    continue;
                  }
                }
                // Separar nome e detalhes
                const [nomePrincipal, ...detalhes] = item.nome.split(',');
                doc.fontSize(11).text(`• ${nomePrincipal.trim()}`, 70);
                for (let detalhe of detalhes) {
                  if (detalhe.trim() === '') continue;
                  let detalheFormatado = detalhe;
                  if (detalhe.includes('Obs:')) {
                    detalheFormatado = detalhe.replace('Obs:', 'Observação:').trim();
                  } else if (detalhe.includes('Qtd:')) {
                    detalheFormatado = detalhe.replace('Qtd:', 'Quantidade executada:').trim();
                  } else if (detalhe.includes('Quantidade restante: 0')) {
                    detalheFormatado += '\n • Etapa concluída';
                  }
                  doc.fontSize(10).text(detalheFormatado.trim(), 80);
                }
                if (item.observacao && item.observacao.trim() !== '') {
                  doc.fontSize(10).text(`Obs: ${item.observacao}`, 80);
                }
                if (item.current_quantity == 0) {
                  doc.fontSize(10).text('Etapa concluída', 80);
                }
                doc.moveDown(0.5); // Espaço entre itens do checklist
              }
              doc.moveDown(0.5); // Espaço após o checklist
            } else {
              doc.fontSize(11).text('Checklist concluídos: -', 60);
              doc.moveDown(2);
            }
            doc.moveDown(2);

            if (atvDia.imagens && atvDia.imagens.length > 0) {
              doc.fontSize(11).text('Anexos:', 60);
              doc.moveDown(0.5);

              const imageWidth = 80;
              const imageHeight = 60;
              let imgX = 60;
              const imgY = doc.y;

              for (const img of atvDia.imagens) {
                try {
                  const buffer = Buffer.isBuffer(img) ? img : Buffer.from(img.data);
                  doc.image(buffer, imgX, imgY, { width: imageWidth, height: imageHeight });
                  imgX += imageWidth + 10;
                } catch (err) {
                  console.error('Erro ao inserir imagem:', err);
                }
              }
              // Move o cursor para baixo das imagens
              doc.y = imgY + imageHeight + 10;
            } else {
              doc.fontSize(12).text('Nenhuma imagem registrada para esta atividade.', 60);
              doc.moveDown(1);
            }

// Barra de progresso
            doc.fontSize(11).text('Progresso da Atividade:', 60, doc.y + 10);
            const percentStr = atvDia.checklist_porcentagem ?? "0";
            const percent = Math.max(0, Math.min(100, parseInt(percentStr, 10) || 0));
            const barX = 60;
            const barY = doc.y;
            const barWidth = 200;
            const barHeight = 18;
            const radius = 8;

            doc.save()
              .roundedRect(barX, barY, barWidth, barHeight, radius)
              .fill('#e0e0e0');

            const fillWidth = (barWidth * percent) / 100;
            doc
              .roundedRect(barX, barY, fillWidth, barHeight, radius)
              .fill('#4caf50');

            doc
              .fillColor('#000')
              .fontSize(11)
              .text(`${percent}%`, barX, barY + 2, {
                width: barWidth,
                align: 'center'
              });

            doc.restore();
            doc.y = barY + barHeight + 10;
          }
        } else {
          doc.fontSize(12).text('Nenhum dia de obra encontrado para o filtro.');
        }
        doc.moveDown(2);
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

    }
  }
    catch
      (error)
      {
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
