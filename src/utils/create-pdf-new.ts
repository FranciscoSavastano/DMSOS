import { PDFDocument, Image } from 'pdfkit';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import 'pdf-creator-node'
import { prisma } from '@/lib/prisma'

const tempFilePath = path.join(__dirname, 'temp_anexpath.txt');

export async function initWrite(request: any, reply: any) {
  if (!request.isMultipart()) {
    console.log(request.headers['content-type']);
    return reply.status(400).send({ message: 'Invalid content type' });
  }

  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
  }

  const files = await request.multipart(); // Use multipart parsing

  const fileData = [];
  for await (const file of files) {
    const buffer = await file.toBuffer();
    const base64Image = `data:<span class="math-inline">\{file\.mimetype\};base64,</span>{buffer.toString('base64')}`;
    fileData.push(base64Image);
  }

  fs.writeFileSync(tempFilePath, fileData.join('\n'));
  return reply.send({ message: 'Files uploaded successfully' });
}

function determinePeriod(created_at: Date): string {
  const momenthour = moment(created_at);
  const createdAt = momenthour.tz('America/Sao_Paulo');
  const hour = createdAt.hour();
  return hour >= 18 || hour < 6 ? 'Noturno' : 'Diurno';
}

function formatarData(created_at: Date): string {
  const momenthour = moment(created_at);
  const data = momenthour.tz('America/Sao_Paulo');
  return data.locale('pt-br').format('dddd, D [de] MMMM [de] YYYY [às] HH:mm');
}

export async function CreatePdf(duty: any) {
  console.log("Chamdo")
  const users = duty.operadoresNome;
  const data = duty.created_at;
  const contract = duty.contrato;
  const dutyid = duty.id;
  const ocurrences = await prisma.ocorrencia.findMany({
    where: {
      plantao_id: dutyid,
    },
  });
  const ocurrence = ocurrences.map((ocurrence) => {
    const formattedDate = moment.utc(ocurrence.pm_horario).format('HH:mm');
    return {
      ...ocurrence,
      newPmHorario: formattedDate,
    };
  });
  const dataformatada = formatarData(duty.created_at);
  const periodo = determinePeriod(duty.created_at);

  const html = fs.readFileSync('./src/utils/pdf-model.html', 'utf8');

  const anexpath = fs.readFileSync(tempFilePath, 'utf-8').split('\n');

  async function getImage() {
    const images = {
      comercialImage: './src/utils/pdf-img/com-image.png',
      fadelogo: './src/utils/pdf-img/fade-logo.png',
      simplelogo: './src/utils/pdf-img/logo-simple',
      techborder: './src/utils/pdf-img/tech-border.png',
      bordercover: './src/utils/pdf-img/border-cover.png'
  };
  return images
  }
  
  const doc = new PDFDocument();
  const images = await getImage();
  // Add the first page (CAPA)
  doc.addPage();
  doc.image(images.comercialImage, 0, 0, { width: doc.page.width }); // Adjust image dimensions as needed

  // Add the second page (OBJETIVO)
  doc.addPage();
  doc.fontSize(32).fill('#001233').text('OBJETIVO', { align: 'center' });
  doc.fontSize(21).fill('#001233').text(
    'Este documento tem por objetivo apresentar, documentar e registrar todas as ocorrências, posturas e anomalias na operação diária do condomínio analisadas através do monitoramento das câmeras de vigilância (CFTV).',
    { align: 'center', lineGap: 10 }
  );

  // Add subsequent pages (RELATÓRIO FOTOGRÁFICO, POLÍCIA MILITAR)
  // ... similar to the 'OBJETIVO' page, using text, image, and table methods

  // Write the PDF to a file
  console.log("Criado")
  doc.pipe(fs.createWriteStream(`./src/gendocs/output ${duty.id}.pdf`));
  doc.end();

  
  }