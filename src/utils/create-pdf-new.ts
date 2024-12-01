import pdfkit from 'pdfkit'
import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import 'pdf-creator-node'
import { prisma } from '@/lib/prisma'
const tempFilePath = path.join(__dirname, 'temp_anexpath.txt')
export async function initWrite(request: any, reply: any) {
  if (!request.isMultipart()) {
    console.log(request.headers['content-type'])
    return reply.status(400).send({ message: 'Invalid content type' })
  }

  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath)
  }

  const files = await request.multipart() // Use multipart parsing

  const fileData = []
  for await (const file of files) {
    const buffer = await file.toBuffer()
    const base64Image = `data:<span class="math-inline">\{file\.mimetype\};base64,</span>{buffer.toString('base64')}`
    fileData.push(base64Image)
  }

  fs.writeFileSync(tempFilePath, fileData.join('\n'))
  return reply.send({ message: 'Files uploaded successfully' })
}

function determinePeriod(created_at: Date): string {
  const momenthour = moment(created_at)
  const createdAt = momenthour.tz('America/Sao_Paulo')
  const hour = createdAt.hour()
  return hour >= 18 || hour < 6 ? 'Noturno' : 'Diurno'
}

function formatarData(created_at: Date): string {
  const momenthour = moment(created_at)
  const data = momenthour.tz('America/Sao_Paulo')
  return data.locale('pt-br').format('dddd, D [de] MMMM [de] YYYY [às] HH:mm')
}

export async function CreatePdf(duty: any) {
  console.log('Chamdo')
  const users = duty.operadoresNome
  const data = duty.created_at
  const contract = duty.contrato
  const dutyid = duty.id
  const ocurrences = await prisma.ocorrencia.findMany({
    where: {
      plantao_id: dutyid,
    },
  })
  const ocurrence = ocurrences.map((ocurrence) => {
    const formattedDate = moment.utc(ocurrence.pm_horario).format('HH:mm')
    return {
      ...ocurrence,
      newPmHorario: formattedDate,
    }
  })
  const dataformatada = formatarData(duty.created_at)
  const periodo = determinePeriod(duty.created_at)

  const html = fs.readFileSync('./src/utils/pdf-model.html', 'utf8')

  const anexpath = fs.readFileSync(tempFilePath, 'utf-8').split('\n')

  async function getImage() {
    const images = {
      comercialImage: './src/utils/pdf-img/com-image.png',
      fadelogo: './src/utils/pdf-img/fade-logo.png',
      simplelogo: './src/utils/pdf-img/logo-simple.png',
      techborder: './src/utils/pdf-img/tech-border.png',
      bordercover: './src/utils/pdf-img/border-cover.png',
    }
    return images
  }

  const PDFDocument = pdfkit
  const doc = new PDFDocument({ size: 'A4' })
  const images = await getImage()
  const halfPageWidth = 595 / 2
  // Add the first page (CAPA)  // Adjust image dimensions as needed
  const comercialImagePath = images.comercialImage
  const fadeLogoPath = images.fadelogo
  const simpleLogoPath = images.simplelogo

  // Add the commercial image
  doc.image(comercialImagePath, 0, 0, { width: 695, height: 500 }) // Adjust dimensions as needed

  // Add the fade logo
  doc.image(fadeLogoPath, 0, 430, { fit: [200, 200] }) // Maintain logo aspect ratio

  // Add the contract text (assuming `contract` is a string)
  const contractFontSize = 24 // Adjust font size as needed
  doc
    .fontSize(contractFontSize)
    .fill('#000000') // Adjust text color
    .text(contract, 0, 580, { align: 'center' }) // Center align text

  // Add the "RELATÓRIO DIÁRIO DE OPERAÇÃO" heading
  const headingFontSize = 18 // Adjust font size as needed
  doc
    .fontSize(headingFontSize)
    .fill('#000000') // Adjust text color
    .text('RELATÓRIO DIÁRIO DE OPERAÇÃO', 0, 620, { align: 'center' }) // Center align text

  // Add the operator and period information (assuming `users` and `periodo` are strings)
  const infoFontSize = 15 // Adjust font size as needed
  doc
    .fontSize(infoFontSize)
    .fill('#000000') // Adjust text color
    .text(`OPERADOR: ${users} PERÍODO: ${periodo}`, 0, 700)

  // Add the simple logo
  doc.image(simpleLogoPath, 400, 650, { fit: [200, 200] }) // Maintain logo aspect ratio

  // Add the website link (assuming it's a string)
  const linkFontSize = 13 // Adjust font size as needed// Adjust link color
  doc
    .fontSize(linkFontSize)
    .text(`www.dmsys.com.br`, 440, 800, {
      link: 'http://dmsys.com.br',
      align: 'right',
      height: 50,
      width: 120,
    }) // Set link behavior and underline

  // Add the formatted date (assuming `dataformatada` is a string)
  doc
    .fontSize(linkFontSize)
    .fill('#000000')
    .text(dataformatada, 0, 800, { align: 'left', height: 50 }) // Right align text
  // Create a content container

  // Add the second page (OBJETIVO)
  doc.addPage()
  doc.image(images.techborder, 0, 122, { width: 90, height: 720 })
  const objectivetext =
    'Este documento tem por objetivo apresentar, documentar e registrar todas as ocorrências, posturas e anomalias na operação diária do condomínio analisadas através do monitoramento das câmeras de vigilância (CFTV).'
  doc.fontSize(32).fill('#001233').text('OBJETIVO', { align: 'center' })
  doc
    .fontSize(15)
    .fill('#001233')
    .text(objectivetext, 100, 200, { lineGap: 10 })

  // ... rest of your code to add content for subsequent pages

  // Write the PDF to a file
  console.log('Criado')
  doc.pipe(fs.createWriteStream(`./src/gendocs/output.pdf`))
  doc.end()
}
