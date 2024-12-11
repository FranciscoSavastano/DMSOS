import pdfkit from 'pdfkit-table'
import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import 'pdf-creator-node'
import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'
var canwrite = false
var PDFtable = require('pdfkit-table')
export async function initWrite(request: FastifyRequest, reply: FastifyReply) {
  const tempFilePath = path.join(__dirname, 'temp_anexpath.txt')

  if (!request.headers['content-type'].startsWith('multipart/form-data')) {
    console.log(request.headers['content-type'])
    return reply.status(400).send({ message: 'Invalid content type' })
  }

  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath)
  }

  const files = request.files()

  const fileData = []
  for await (const file of files) {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks = []
      file.file.on('data', (chunk) => chunks.push(chunk))
      file.file.on('end', () => resolve(Buffer.concat(chunks)))
      file.file.on('error', reject)
    })

    const base64Image = buffer.toString('base64')
    fileData.push(base64Image) // Store only the Base64 string
  }

  // Write the file data to the temporary file
  fs.writeFileSync(tempFilePath, fileData.join('\n'))
  canwrite = true
  return reply.send({ message: 'Files uploaded successfully' })
}

export async function writeDesc(request: FastifyRequest, reply: FastifyReply) {
  const tempFilePath = path.join(__dirname, 'temp_anexpath_desc.txt')
  const descriptions = request.body.descriptions // Assuming descriptions are sent as an array in the request body

  try {
    fs.writeFileSync(tempFilePath, descriptions.join('\n'))

    return reply
      .status(200)
      .send({ message: 'Descriptions written successfully' })
  } catch (error) {
    console.error('Error writing to file:', error)
    return reply.status(500).send({ message: 'Internal server error' })
  }
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
  var anexpath
  const dataformatada = formatarData(duty.created_at)
  const periodo = determinePeriod(duty.created_at)
  const tempDescFilePath = path.join(__dirname, 'temp_anexpath_desc.txt')
  const tempFilePath = path.join(__dirname, 'temp_anexpath.txt')
  if (fs.existsSync(tempFilePath)) {
    anexpath = fs.readFileSync(tempFilePath, 'utf-8').split('\n')
  } else {
    anexpath = false
  }
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
  doc.fontSize(linkFontSize).text(`www.dmsys.com.br`, 440, 800, {
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
  doc.image(images.bordercover, 0, 122, { width: 90, height: 720 })
  const objectivetext =
    'Este documento tem por objetivo apresentar, documentar e registrar todas as ocorrências, posturas e anomalias na operação diária do condomínio analisadas através do monitoramento das câmeras de vigilância (CFTV).'
  doc.fontSize(32).fill('#001233').text('OBJETIVO', { align: 'center' })
  doc
    .fontSize(15)
    .fill('#001233')
    .text(objectivetext, 100, 200, { lineGap: 10 })

  if (anexpath != false) {
    doc.addPage()
    doc
      .fontSize(32)
      .fill('#001233')
      .text('RELATORIO FOTOGRAFICO', 40, 30, { align: 'center' })

    const base64Images = fs
      .readFileSync('./src/utils/temp_anexpath.txt', 'utf-8')
      .split('\n')

    const imagesdescription = fs
      .readFileSync('./src/utils/temp_anexpath_desc.txt', 'utf-8')
      .split('\n')

    // Calculate the maximum number of images per row based on page width
    const imageWidth = 90
    const imageMargin = 20

    let x = imageMargin
    let y = imageWidth

    base64Images.forEach((base64Image, index) => {
      // Convert base64 string to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64')
      const imagedesc = imagesdescription[index]
      // Add the image to the PDF
      doc.image(imageBuffer, x, y, { width: 150, height: 150 })
      doc.rect(x, y + 150, 150, 70).fill('#007bff') // Adjust the color as needed
      // Add text within the rectangle
      doc
        .fontSize(10)
        .fill('#fff')
        .text(imagedesc, x + 5, y + 155, { width: 150 })
      x += 200
      if (index != 0) {
        if ((index + 1) % 3 === 0) {
          x = imageMargin
          y += 230
        }
      }
      if ((index + 1) % 9 === 0) {
        doc.addPage()
        doc
          .fontSize(32)
          .fill('#001233')
          .text('RELATORIO FOTOGRAFICO', 40, 30, { align: 'center' })
        x = imageMargin
        y = imageWidth
      }
    })
  }
  //POLICIA MILITAR
  if(ocurrence){
    doc.addPage()
    doc.fontSize(32).fill('#001233').text('POLICIA MILITAR', { align: 'center' })
    const table: {
      title: string
      headers: string[]
      rows: string[][]
    } = {
      title: 'OCORRENCIAS',
      headers: ['HORÁRIO', 'LOCAL', 'OBSERVAÇÃO'],
      rows: ocurrence.map((ocurrence) => [
        ocurrence.newPmHorario || '',
        ocurrence.pm_local || '',
        ocurrence.pm_observacao || '',
      ]),
    }
    await doc.table(table, {
      width: 500, // Adjust the width as needed
      // Other table options, like font size, colors, etc.
    })
  }
  doc.addPage()
  doc
    .fontSize(32)
    .fill('#001233')
    .text('CONSIDERACOES FINAIS', { align: 'center' })
  doc.rect(0, doc.y, doc.page.width, 50).fill('#fff')
  doc.y += 50 // Adjust the y-coordinate to account for the added space
  doc.fontSize(13).fill('black').text(duty.consideracoes, { align: 'center' })
  
  //Finalize o arquivo e salve na pasta
  console.log('Criado')
  doc.pipe(fs.createWriteStream(`./src/gendocs/Relatorio ${contract} ${dataformatada}.pdf`))
  doc.end()



  //Delete os arquivos temporarios, se não houver, descreva no console
  try {
    fs.unlinkSync(tempFilePath)
  }
  catch(err) {
    console.log("Não existem imagens")
  }
  try {
    fs.unlinkSync(tempDescFilePath)
  }
  catch(err) {
    console.log("Não existem descrições")
  }
} 
