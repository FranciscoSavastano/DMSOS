import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import pdfkit from 'pdfkit-table';
import path from "path";
import sharp from 'sharp';
import fs from 'fs';
import { Writable } from 'stream';

const watermarkPath = path.join('./src/utils/pdf-img/logo-jpg.jpg');

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

    // Get information about the obra
    const obraResponse = axios.post('http://127.0.0.1:3333/v1/obra/read', {
      id: id,
    }, {
      headers: {
        Authorization: bearerAuth,
      },
    }).catch(error => {
      if (error.response.status === 404) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'Obra not found',
        });
      }
      else if (error.response.status === 401) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid or missing authorization token',
        });
      }
      console.error('Error fetching obra data:', error);
      throw new Error('Failed to fetch obra data');
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
    for (const user of usuariosData.data) {
      console.log(`User ID: ${user.id}, Name: ${user.nome}`);
    }

    // Create PDF with obra data
    const doc = new pdfkit();

    // For each page, set a background image company logo
    doc.fontSize(25).text('Relatório Diario de Obra', { align: 'center' });
    doc.image(watermarkPath, 40, 23, { fit: [100, 100], align: 'center', valign: 'center' });

    // Add a horizontal line
    doc.moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();

    // Vertical line
    doc.moveTo(300, 100)
      .lineTo(300, 160)
      .stroke();

    // Header content
    doc.fontSize(14).text('Responsável da Obra', 60, 110, { underline: true, width: 220 });
    doc.fontSize(12).text(`Nome: ${responseData.gerente?.nome || '-'}`, 60, 130, { width: 220 });

    // Projeto (right side)
    doc.fontSize(12).text(`Projeto: ${responseData.nome}`, 320, 110, { align: 'left', width: 220 });
    doc.fontSize(12).text(`Cliente: ${responseData.cliente?.nome || '-'}`, 320, doc.y, { width: 220 });
    doc.fontSize(12).text(`Número da Proposta: ${responseData.numproposta || '-'}`, 320, doc.y, { width: 220 });

    // Closing horizontal line for header
    doc.moveTo(50, 160)
      .lineTo(550, 160)
      .stroke();

    console.log('Equipe:', responseData.equipe);

    let tableEndY = 170; // Default position if no table

    if (responseData.equipe && responseData.equipe.length > 0 && usuariosData.data && Array.isArray(usuariosData.data)) {
      // Filter users that are in the team
      const equipeUsuarios = usuariosData.data.filter((user: any) =>
        responseData.equipe.includes(user.id)
      );

      if (equipeUsuarios.length > 0) {
        const equipeTable = {
          headers: ['Nome', 'Cargo'],
          rows: equipeUsuarios.map((u: any) => [u.nome, u.user_role]),
        };

        // Calculate table height: header + rows + padding
        const rowHeight = 20; // Approximate row height
        const headerHeight = 25; // Header height
        const tableHeight = headerHeight + (equipeUsuarios.length * rowHeight) - 30; // -30px padding

        await doc.table(equipeTable, {
          width: 247,
          x: 53,
          y: 170,
          columnsSize: [130, 100]
        });

        // Update tableEndY to actual table end position
        tableEndY = 170 + tableHeight;
      }
    } else {
      doc.fontSize(12).text('Nenhuma equipe cadastrada.', 60, 170);
      tableEndY = 190; // Adjust for text height
    }

    // Draw responsive horizontal line below the table/text
    doc.moveTo(50, tableEndY)
      .lineTo(550, tableEndY)
      .stroke();

    // Extend vertical line to meet the new horizontal line
    doc.moveTo(300, 160)
      .lineTo(300, tableEndY)
      .stroke();

    // Use the diaObraId
    const diaObra = diaObraId ? responseData.dia_obra.find((d: any) => d.id === diaObraId) : null;

    if (diaObra) {
      console.log('Dia da Obra:', diaObra);

      const formatLocalDateTime = (dateValue: string | Date) => {
        let dateObj: Date;

        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          if (dateValue.includes('T') && dateValue.includes('Z')) {
            dateObj = new Date(dateValue);
            dateObj.setHours(dateObj.getHours() + 3);
          } else {
            const cleanDateTime = dateValue.replace(/\.\d{3}$/, '');
            const [datePart, timePart] = cleanDateTime.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hour, minute, second] = timePart ? timePart.split(':') : ['00', '00', '00'];

            dateObj = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour || '0'),
              parseInt(minute || '0'),
              parseInt(second || '0')
            );
          }
        } else {
          dateObj = new Date();
        }

        return dateObj;
      };

      const dataFormatada = formatLocalDateTime(diaObra.data).toLocaleDateString('pt-BR');
      const inicioFormatado = formatLocalDateTime(diaObra.inicio).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const terminoFormatado = formatLocalDateTime(diaObra.termino).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.fontSize(14).text(`Data: ${dataFormatada}`, 320, 170, {
        align: 'left',
        width: 220
      });
      doc.fontSize(14).text(`Inicio: ${inicioFormatado}`, 320, 190, {
        align: 'left',
        width: 220
      });
      doc.fontSize(14).text(`Termino: ${terminoFormatado}`, 320, 210, {
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
        columnsSize: [130, 100] // 80% e 20% da largura total,
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
                doc.fontSize(13).text(`Atividade: ${atividade.nome}`, 60, tableEndY + 20);
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
              console.log(doc.y)
              if(doc.y > 550) {
                doc.addPage();
              }
              doc.fontSize(11).text('Anexos:', 60);
              doc.moveDown(0.5);

              const imageWidth = 80;
              const imageHeight = 60;
              let imgX = 60;
              let imgY = doc.y;

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

            // Barra de progresso - verificar se há espaço suficiente
            const progressBarHeight = 50; // Altura total necessária para texto + barra + espaçamento
            if (doc.y + progressBarHeight > 750) { // 750 é próximo do limite da página A4
              doc.addPage();
            }

            doc.fontSize(11).text('Progresso da Atividade:', 60, doc.y + 10);
            const percentStr = atvDia.checklist_porcentagem ?? "0";
            const percent = Math.max(0, Math.min(100, parseInt(percentStr, 10) || 0));
            const barX = 60;
            const barY = doc.y;
            const barWidth = 200;
            const barHeight = 18;
            const radius = 8;

            if(barY > 700) {
              doc.addPage();
            }
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
              .text(`${percent}%`, barX, barY +3, {
                width: barWidth,
                align: 'center'
              });

            doc.restore();
            doc.y = barY + barHeight + 10;
          }
        } else {
          doc.fontSize(12).text('Nenhum dia de obra encontrado para o filtro.', 60 , 320);
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
