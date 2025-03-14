import pdfkit from 'pdfkit-table'
import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'
import { Ocorrencia } from '@prisma/client'
import { FastifyMultipartRequest } from '@fastify/multipart'
import { test } from 'vitest'
var canwrite = false
var PDFtable = require('pdfkit-table')

let pdfCreationPromise: Promise<unknown>
let descWritePromise: Promise<unknown>
let archpath: string
let startTime: number
let unionTableEntries = []

export function startWait(): number {
  startTime = Date.now()
  return startTime
}

export function getElapsedTime(): number {
  if (!startTime) {
    throw new Error("Wait function hasn't been started yet!")
  }
  return Date.now() - startTime
}

// In-memory data storage (alternative to files)
let uploadedFileData: string[] = [] // Array to store Base64 strings
let descriptions: string[] = [] // Array to store descriptions
let lockAcquired = false
let uploadPromise: Promise<unknown>
let descriptionPromise: Promise<unknown>
let state = 0

export async function initWrite(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (lockAcquired) {
    return reply
      .code(429)
      .header('Retry-After', '1')
      .send({ message: 'Outro upload em progresso, seu pedido está em fila' })
  }
  state++ // deve ser 1
  lockAcquired = true

  const contentType = request.headers['content-type']

  if (!contentType?.startsWith('multipart/form-data')) {
    return reply.status(400).send({ message: 'Invalid content type' })
  }

  // Check if a previous upload is in progress
  if (uploadedFileData.length > 0) {
    const startTime = Date.now()
    let wait = true

    while (wait && Date.now() - startTime < 900) {
      // Wait for up to 900ms
      console.log('Waiting for previous upload to complete...')
    }

    if (Date.now() - startTime >= 1500) {
      console.log('Timeout occurred. Clearing previous data.')
      uploadedFileData = []
    }
  }

  const files = request.files()

  uploadPromise = new Promise<void>(async (resolve, reject) => {
    try {
      let index = 0
      for await (const file of files) {
        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const chunks = []
          file.file.on('data', (chunk) => chunks.push(chunk))
          file.file.on('end', () => resolve(Buffer.concat(chunks)))
          file.file.on('error', reject)
        })

        const base64Image = buffer.toString('base64')
        uploadedFileData.push(base64Image)
        index += 1
      }
      resolve() // Resolve the promise when upload is complete
    } catch (error) {
      reject(error) // Reject the promise if an error occurs
    }
  })

  await uploadPromise // Wait for the upload to finish
  state++ // deve ser 2
  lockAcquired = false
  return reply.send({ message: 'Files uploaded successfully' })
}

export async function writeRondasUnion(
  request: FastifyMultipartRequest,
  reply: FastifyReply,
) {
  try {
    const parts = await request.parts()

    const formData: Record<string, any> = {}
    const images: any[] = []

    for await (const part of parts) {
      if (part.type === 'file') {
        // Handle file parts
        const buffer = await part.toBuffer()
        images.push({
          filename: part.filename,
          mimetype: part.mimetype,
          data: buffer.toString('base64'),
        })
      } else {
        // Handle field parts
        const key = part.fieldname
        const value = part.value
        if (
          key.startsWith('time[') ||
          key.startsWith('bloco[') ||
          key.startsWith('observation[')
        ) {
          const match = key.match(/\[(\d+)\]/)
          if (match) {
            const index = parseInt(match[1])
            const fieldName = key.split('[')[0]
            if (!formData[index]) {
              formData[index] = {}
            }
            formData[index][fieldName] = value
          }
        }
      }
    }

    // Combine form data and images
    unionTableEntries = Object.entries(formData).map(
      ([index, data]: [string, any]) => ({
        time: data.time,
        bloco: data.bloco,
        observation: data.observation,
        images: images,
      }),
    )

    console.log('Processed entries:', unionTableEntries)

    return reply.status(201).send({
      message: 'Rondas Union data processed successfully.',
      data: unionTableEntries,
    })
  } catch (error) {
    console.error('Error processing Rondas Union data:', error)
    return reply.status(500).send({ message: 'Internal server error.' })
  }
}
export async function writeDesc(request: FastifyRequest, reply: FastifyReply) {
  state++ // deve ser 3
  descWritePromise = new Promise<void>(async (resolve, reject) => {
    descriptions = request.body.descriptions // Store descriptions in memory
    resolve()
    await descWritePromise
    state++ // deve ser 4
    return reply
      .status(200)
      .send({ message: 'Descriptions received successfully' })
  })
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

function formatDateForFilename(createdAt: Date): string {
  const formattedDate = createdAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Replace "/" and ":" with underscores for a more file-friendly format
  return formattedDate.replace(/[/:]/g, '_')
}

export async function CreatePdf(duty: any) {
  await uploadPromise
  await descWritePromise
  if (state > 0) {
    while (state < 4) {
      console.log(`wait step ${state}`)
    }
  }
  pdfCreationPromise = new Promise(async (resolve) => {
    const users = duty.operadoresNome
    const filteredUsers = users.map((fullName) => {
      const nameParts = fullName.split(' ')
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
    })
    const data = duty.created_at
    const contract = duty.contrato
    const addinfo = duty.informacoes_adicionais
    console.log(addinfo)
    const dutyid = duty.id
    const ocurrences = await prisma.ocorrencia.findMany({
      where: {
        plantao_id: dutyid,
      },
    })
    const ocurrence = ocurrences.map((ocurrence) => {
      const formattedDateStart = moment.utc(ocurrence.horario).format('HH:mm')
      const formattedDateEnd = moment.utc(ocurrence.termino).format('HH:mm')
      const formattedData = moment.utc(ocurrence.data).format('DD/MM/YYYY')
      return {
        ...ocurrence,
        newHorario: formattedDateStart,
        newTermino: formattedDateEnd,
        newData: formattedData,
      }
    })
    const dataformatada = formatarData(duty.created_at)

    const periodo = determinePeriod(duty.created_at)
    const tempDescFilePath = path.join(__dirname, 'temp_anexpath_desc.txt')
    const tempFilePath = path.join(__dirname, 'temp_anexpath.txt')

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
      .text(`OPERADOR: ${filteredUsers}\n\nPERÍODO: ${periodo}`, 0, 700)

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
    doc.fontSize(28).fill('#001233').text('OBJETIVO', { align: 'center' })
    doc
      .fontSize(15)
      .fill('#001233')
      .text(objectivetext, 100, 200, { lineGap: 10 })
    if (uploadedFileData.length == 0) {
      console.log('Nao existem imagens')
    }
    if (descriptions.length == 0) {
      console.log('Nao exitem descrições')
    }

    if (uploadedFileData.length > 0) {
      doc.addPage()
      doc
        .fontSize(28)
        .fill('#001233')
        .text('RELATÓRIO FOTOGRÁFICO', 40, 30, { align: 'center' })

      const base64Images = uploadedFileData
      const imagesdescription = descriptions

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
            .fontSize(28)
            .fill('#001233')
            .text('RELATÓRIO FOTOGRÁFICO', 40, 30, { align: 'center' })
          x = imageMargin
          y = imageWidth
        }
      })
    }
    //POLICIA MILITAR
    if (contract === 'Lead Américas') {
      const rondasTable: {
        title: string
        headers: string[]
        rows: string[][]
      } = {
        title: 'RONDA',
        headers: [
          'HORÁRIO INICIO',
          'HORÁRIO TERMINO',
          'LOCAL',
          'RESPONSÁVEL',
          'OBSERVAÇÃO',
        ],
        rows: [],
      }

      const limpezaTable: {
        title: string
        headers: string[]
        rows: string[][]
      } = {
        title: 'LIMPEZA',
        headers: ['HORÁRIO', 'LOCAL', 'DATA'],
        rows: [],
      }

      for (const occurrence of ocurrence) {
        if (occurrence.ocurrence_type === 'Limpeza') {
          limpezaTable.rows.push([
            occurrence.newHorario || '',
            occurrence.local || '',
            occurrence.newData || '',
          ])
        } else {
          rondasTable.rows.push([
            occurrence.newHorario || '',
            occurrence.newTermino || '',
            occurrence.local || '',
            occurrence.responsavel || '',
            occurrence.observacao || '',
          ])
        }
      }

      if (rondasTable.rows.length > 0) {
        doc.addPage()
        doc
          .fontSize(28)
          .fill('#001233')
          .text('RONDAS NO EMPREENDIMENTO', { align: 'center' })
        await doc.table(rondasTable, {
          width: 500,
          // Other table options
        })
      }

      if (limpezaTable.rows.length > 0) {
        doc.moveDown(15)
        doc
          .fontSize(28)
          .fill('#001233')
          .text('LIMPEZA E CONSERVAÇÃO', { align: 'center' })
        await doc.table(limpezaTable, {
          width: 500,
          // Other table options
        })
      }
    }
    const elevadorTable: {
      title: string
      headers: string[]
      rows: string[][]
    } = {
      title: 'CHECKLIST ELEVADORES',
      headers: [
        'ELEVADOR',
        'BLOCO',
        'CLASSE',
        'STATUS',
        'INTERFONE',
        'CÂMERAS',
        'OBSERVAÇÃO',
      ],
      rows: [],
    }
    for (const elevador of addinfo) {
      elevadorTable.rows.push([elevador])
      console.log(elevador)
    }
    doc.addPage()
    doc
      .fontSize(28)
      .fill('#001233')
      .text('LIMPEZA E CONSERVAÇÃO', { align: 'center' })
    await doc.table(elevadorTable, {
      width: 500,
    })

    if (contract === 'Union Square') {
      // Constants for layout
      const imageMargin = 20
      const imageWidth = 90

      // Group entries by bloco
      const entriesByBloco = unionTableEntries.reduce((acc, entry) => {
        const blocoKey = entry.bloco
        if (!acc[blocoKey]) {
          acc[blocoKey] = []
        }
        acc[blocoKey].push(entry)
        return acc
      }, {})

      // Sort entries by time within each bloco
      Object.values(entriesByBloco).forEach((entries) => {
        entries.sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        )
      })

      // Process each bloco
      let isFirstPage = true
      for (const [bloco, entries] of Object.entries(entriesByBloco)) {
        // Get bloco number from the string (e.g., "bloco1" -> "1")
        const blocoNumber = bloco.replace(/\D/g, '')

        let imagelength = 0
        // Add new page (except for first page)
        for (const entry of entries) {
          imagelength += entry.images.length
        }
        if (imagelength > 0) {
          doc.addPage()

          // Initialize positioning for images
          let x = imageMargin
          let y = imageWidth

          // Add page title
          doc
            .fontSize(28)
            .fill('#001233')
            .text(`RELATORIO FOTOGRAFICO BL${blocoNumber}`, 40, 30, {
              align: 'center',
            })

          // Process all images from entries
          let imageIndex = 0

          for (const entry of entries) {
            if (entry.images && entry.images.length > 0) {
              for (const image of entry.images) {
                // Create image description

                let timeStr = entry.time.toString()
                timeStr = timeStr.split('Z')
                let imageDesc
                if (entry.observation) {
                  imageDesc = `${timeStr[0]}: ${entry.observation}`
                } else {
                  imageDesc = timeStr[0]
                }

                // Check if we need a new page
                if (imageIndex > 0 && imageIndex % 9 === 0) {
                  doc.addPage()
                  doc
                    .fontSize(28)
                    .fill('#001233')
                    .text(`RELATORIO FOTOGRAFICO BL${blocoNumber}`, 40, 30, {
                      align: 'center',
                    })
                  x = imageMargin
                  y = imageWidth
                }

                try {
                  // Convert base64 to Buffer
                  const imageBuffer = Buffer.from(image.data, 'base64')

                  // Add image
                  doc.image(imageBuffer, x, y, { width: 150, height: 150 })

                  // Add blue rectangle with description
                  doc.rect(x, y + 150, 150, 70).fill('#007bff')

                  // Add description text
                  doc
                    .fontSize(10)
                    .fill('#fff')
                    .text(imageDesc, x + 5, y + 155, { width: 140 })

                  // Update positioning
                  x += 200

                  // Move to next row if needed
                  if (imageIndex !== 0 && (imageIndex + 1) % 3 === 0) {
                    x = imageMargin
                    y += 230
                  }

                  imageIndex++
                } catch (error) {
                  console.error('Error adding image to PDF:', error)
                  continue
                }
              }
            }
          }
        }
      }
    }

    if (contract === 'Centro Metropolitano') {
      doc.addPage()
      doc
        .fontSize(28)
        .fill('#001233')
        .text('POLICIA MILITAR', { align: 'center' })
      const table: {
        title: string
        headers: string[]
        rows: string[][]
      } = {
        title: 'OCORRENCIAS',
        headers: ['HORÁRIO', 'LOCAL', 'OBSERVAÇÃO'],
        rows: ocurrence.map((ocurrence) => [
          ocurrence.newHorario || '',
          ocurrence.local || '',
          ocurrence.observacao || '',
        ]),
      }
      await doc.table(table, {
        width: 500, // Adjust the width as needed
        // Other table options, like font size, colors, etc.
      })
    }
    doc.addPage()
    doc
      .fontSize(28)
      .fill('#001233')
      .text('CONSIDERACOES FINAIS', { align: 'center' })
    doc.rect(0, doc.y, doc.page.width, 50).fill('#fff')
    doc.y += 50 // Adjust the y-coordinate to account for the added space
    doc.fontSize(13).fill('black').text(duty.consideracoes, { align: 'center' })
    doc.fontSize(8).text(`ID ÚNICO: ${duty.id}`, 440, 800, {
      align: 'right',
      height: 50,
      width: 120,
    })

    //Finalize o arquivo e salve na pasta
    const filedate = formatDateForFilename(data)
    console.log('Criado')
    //Se não houver pasta crie uma recursivamente
    const gendocsPath = path.join(__dirname, '/', 'gendocs')
    if (!fs.existsSync(gendocsPath)) {
      fs.mkdirSync(gendocsPath, { recursive: true })
    }
    //Salve o arquivo com um nome dinamico
    const filePath = `${gendocsPath}/Relatorio ${contract} ${filedate} ${dutyid}.pdf`
    altarchpath = `/src/utils/gendocs/Relatorio ${contract} ${filedate} ${dutyid}.pdf`
    const generatePdf = async (doc, filePath): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        doc.pipe(fs.createWriteStream(filePath))
        doc.on('end', () => resolve())
        doc.on('error', (err) => reject(err))
        doc.end()
      })
    }
    unionTableEntries = []
    await generatePdf(doc, filePath)
    doc.end()
    archpath = `${gendocsPath}/Relatorio ${contract} ${filedate} ${dutyid}.pdf`

    //Delete os arquivos temporarios, se não houver, descreva no console
    resolve()
  })
}

export async function sendPdf(request: FastifyRequest, reply: FastifyReply) {
  await pdfCreationPromise
  try {
    if (!archpath) {
      while (!archpath) {
        if (!uploadedFileData) {
          break
        }
      }
      return reply
        .status(500)
        .send({ message: 'Global archpath variable is not set.' })
    }
    // Check for file existence
    try {
      await fs.promises.access(archpath, fs.promises.constants.R_OK)
    } catch (err) {
      if (err.code === 'ENOENT') {
        return reply.status(404).send({ message: 'File not found' })
      } else {
        throw err
      }
    }
    // Send the file
    let newfilepath = archpath.split('/').pop()
    lockAcquired = false
    uploadedFileData = []
    descriptions = []

    return reply
      .download(newfilepath)
      .header('Access-Control-Expose-Headers', 'Content-Disposition')
  } catch (error) {
    console.error('Error sending PDF:', error)
    reply.status(500).send({ message: 'Failed to send PDF.' })
  }
}
