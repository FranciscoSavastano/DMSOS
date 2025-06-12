import pdfkit from 'pdfkit-table'
import sharp from 'sharp';

import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import { prisma } from '@/lib/prisma'
import type { Prisma, PlantaoOperador } from '@prisma/client'
import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify'
import { fastifyMultipart } from '@fastify/multipart'
import { Ocorrencia } from '@prisma/client'
import { FastifyMultipartRequest } from '@fastify/multipart'
import { test } from 'vitest'
import { width } from 'pdfkit/js/page'
import { sendEmail } from './send-email'
import { getPdfReport } from './search-pdf'
var canwrite = false
var PDFtable = require('pdfkit-table')
let sendemailpromise: Promise<unknown>
let pdfCreationPromise: Promise<unknown>
let descWritePromise: Promise<unknown>
let archpath: string

let unionTableEntries = []
export function convertToConventionalDate(dateStr: string): string {
  try {
    // Parse the date string into a JavaScript Date object
    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    // Return the formatted date
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error converting date:', error);
    return 'Invalid Date';
  }
}
export function extractTimeFromISO(dateStr: string | Date): string {
  try {
    // Ensure dateStr is a string
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString(); // Convert Date object to ISO string
    }

    if (typeof dateStr !== 'string') {
      throw new Error('Invalid input: dateStr must be a string or Date object');
    }

  
    // Match the time portion (HH:mm) from the ISO 8601 string
    const match = dateStr.match(/T(\d{2}:\d{2})/);
    if (match && match[1]) {
      return match[1]; // Return the extracted time
    }
    throw new Error('Invalid ISO 8601 format');
  } catch (error) {
    console.error('Error extracting time:', error);
    return 'Invalid Time';
  }
}
async function addPlantaoOperadorEmailsToBcc(prisma, duty, bcc) {
  try {
    const plantaoOperadores = await prisma.plantaoOperador.findMany({
      where: {
        plantaoId: duty.id,
      },
      include: {
        operador: true, // Include the related User (operador)
      },
    })

    if (plantaoOperadores && plantaoOperadores.length > 0) {
      plantaoOperadores.forEach((plantaoOperador) => {
        if (plantaoOperador.operador && plantaoOperador.operador.email) {
          bcc.push(plantaoOperador.operador.email)
        }
      })
    }

    return bcc // Return the modified bcc array
  } catch (error) {
    console.error('Error fetching PlantaoOperador emails:', error)
    return bcc // Return the original bcc array in case of error
  }
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
let startTime = 0
    
export async function initWrite(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {

  if (lockAcquired) {
    if (Date.now() - startTime >= 58500) {
      console.log('Timeout occurred. Clearing previous data.')
      uploadedFileData = []
      descriptions = [] // Clear previous data
    }else {
    
    console.log("Retornando cliente com 429")
    return reply
      .code(429)
      .header('Retry-After', '0.5')
      .send({ message: 'Outro upload em progresso, seu pedido está em fila' })
    }
  }
  startTime = Date.now() // Start the timer
  lockAcquired = true
  state++ // deve ser 1
  const contentType = request.headers['content-type']

  if (!contentType?.startsWith('multipart/form-data')) {
    return reply.status(400).send({ message: 'Invalid content type' })
  }
  //Never should enter this part, as the lock is aquired, last resort
  // Check if a previous upload is in progress
  if (uploadedFileData.length > 0) {
    let wait = true
    let printed = 0
    while (wait && Date.now() - startTime < 900) {
      // Wait for up to 900ms
      if (printed < 1){
        console.log('Waiting for previous upload to complete...')
        printed++
      }
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
  return reply.send({ message: 'Files uploaded successfully' })
}

export async function writeRondasUnion(
  request: FastifyMultipartRequest,
  reply: FastifyReply,
) {
  try {
    const parts = await request.parts()

    const formData: Record<string, any> = {}
    const images: Record<number, any[]> = {} // Store images by index

    for await (const part of parts) {
      if (part.type === 'file') {
        // Handle file parts
        const match = part.fieldname.match(/images\[(\d+)\]/)
        if (match) {
          const index = parseInt(match[1])
          const buffer = await part.toBuffer()
          if (!images[index]) {
            images[index] = []
          }
          images[index].push({
            filename: part.filename,
            mimetype: part.mimetype,
            data: buffer.toString('base64'),
          })
        }
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
        images: images[parseInt(index)] || [], // Get images for this index
      }),
    )
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
  return hour >= 19 || hour < 7 ? 'Noturno' : 'Diurno'
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

async function compressImage(base64Image: string, width: number, height: number): Promise<Buffer> {
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const compressedImage = await sharp(imageBuffer)
      //.resize(width, height, { fit: 'inside' }) // Resize the image to fit within the specified dimensions
      .jpeg({ quality: 45 }) // Compress the image with 80% quality
      .toBuffer();
    return compressedImage;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

export async function CreatePdf(duty: any, auth: string) {
  await uploadPromise
  await descWritePromise
  const users = duty.operadoresNomes
  const filteredUsers = users
    .map((fullName) => {
      const nameParts = fullName.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts[nameParts.length - 1]
      return firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || null
    })
    .filter((name) => name !== null)

  const data = duty.created_at
  const relatorioData = duty.data_inicio
  const contract = duty.contrato
  const addinfo = duty.informacoes_adicionais
  const dutyid = duty.id

  const ocurrences = await prisma.ocorrencia.findMany({
    where: { plantao_id: dutyid },
  })

  const formattedOcurrences = ocurrences.map((ocurrence) => ({
    ...ocurrence,
    newHorario: moment.utc(ocurrence.horario).format('HH:mm'),
    newTermino: moment.utc(ocurrence.termino).format('HH:mm'),
    newData: moment.utc(ocurrence.data).format('DD/MM/YYYY'),
  }))

  const dataformatada = moment(data)
    .tz('America/Sao_Paulo')
    .locale('pt-br')
    .format('dddd, D [de] MMMM [de] YYYY [às] HH:mm')
  const periodo =
    moment(data).tz('America/Sao_Paulo').hour() >= 18 ||
    moment(data).tz('America/Sao_Paulo').hour() < 6
      ? 'Noturno'
      : 'Diurno'

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
    //Adicione a terceira pagina se houver imagebs
    if (uploadedFileData.length > 0) {
      doc.addPage()
        .fontSize(28)
        .fill('#001233')
        .text('RELATÓRIO FOTOGRÁFICO', 40, 30, { align: 'center' });
    
      const base64Images = uploadedFileData;
      const imagesdescription = descriptions;
      uploadedFileData = []; // Clear the array after processing
      descriptions = []; // Clear the array after processing
    
      const imageWidth = 150; // Target width for compressed images
      const imageHeight = 120; // Target height for compressed images
      const imageMargin = 20;
    
      let x = imageMargin;
      let y = imageWidth;
    
      for (const [index, base64Image] of base64Images.entries()) {
        try {
          // Compress the image
          const compressedImageBuffer = await compressImage(base64Image, imageWidth, imageHeight);
    
          // Add the compressed image to the PDF
          const imagedesc = imagesdescription[index];
          doc.image(compressedImageBuffer, x, y, { width: imageWidth, height: imageHeight });
          doc.rect(x, y + imageHeight, imageWidth, 70).fill('#007bff'); // Add a blue rectangle for the description
          doc.fontSize(10).fill('#fff').text(imagedesc, x + 5, y + imageHeight + 5, { width: imageWidth });
    
          x += imageWidth + 50; // Move to the next column
          if ((index + 1) % 3 === 0) {
            x = imageMargin;
            y += imageHeight + 100; // Move to the next row
          }
          if ((index + 1) % 9 === 0) {
            x = imageMargin;
            y = imageWidth; // Reset position for a new page
            doc.addPage()
              .fontSize(28)
              .fill('#001233')
              .text('RELATÓRIO FOTOGRÁFICO', 40, 30, { align: 'center' });
          }
        } catch (error) {
          console.error('Error processing image:', error);
          continue; // Skip this image if an error occurs
        }
      }
    }
  //POLICIA MILITAR
  
  if (contract === 'Lead Américas') {
    const rondasTable: {
      title: string
      headers: { label: string; align: string; headerAlign: string }[]
      rows: string[][]
    } = {
      title: 'RONDA',
      headers: [
        { label: 'HORÁRIO INICIO', align: 'center', headerAlign: 'center' },
        { label: 'HORÁRIO TERMINO', align: 'center', headerAlign: 'center' },
        { label: 'LOCAL', align: 'center', headerAlign: 'center' },
        { label: 'RESPONSÁVEL', align: 'center', headerAlign: 'center' },
        { label: 'OBSERVAÇÃO', align: 'center', headerAlign: 'center' },
      ],
      rows: [],
      prepareHeader: () => doc.font('Helvetica-Bold'),
    }

    const limpezaTable: {
      title: string
      headers: { label: string; align: string; headerAlign: string }[]
      rows: string[][]
    } = {
      title: 'LIMPEZA',
      headers: [
        { label: 'HORÁRIO', align: 'center', headerAlign: 'center' },
        { label: 'LOCAL', align: 'center', headerAlign: 'center' },
        { label: 'DATA', align: 'center', headerAlign: 'center' },
      ],
      rows: [],
      prepareHeader: () => doc.font('Helvetica-Bold'),
    }
    for (const occurrence of ocurrences) {
      if (occurrence.ocurrence_type === 'Limpeza') {
        limpezaTable.rows.push([
          extractTimeFromISO(occurrence.horario) || '',
          occurrence.local || '',
          convertToConventionalDate(occurrence.horario) || '',
        ])
      } else {
        rondasTable.rows.push([
          extractTimeFromISO(occurrence.horario) || '',
          extractTimeFromISO(occurrence.termino) || '',
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
        align: 'center',
        x: 50,
        columnSpacing: 2,
        divider: {
          header: {
            disabled: false,
            width: 1,
            opacity: 1,
          },
          horizontal: {
            disabled: false,
            width: 1,
            opacity: 0.5,
          },
        },
        prepareHeader: () => {
          doc.font('Helvetica-Bold').fillColor('black').fontSize(8)
        },
        prepareCell: (cell, row, column) => {
          const options = {
            align: 'center',
            valign: 'center',
            lineBreak: false,
            width: doc.widthOfString(cell),
            height: 10,
          }

          return options
        },
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          if (rectCell) {
            // Alternate row colors (fix for both even and odd rows)
            const rowColor = indexRow % 2 === 0 ? '#d9ecff' : '#b3d5f7'

            doc
              .rect(rectCell.x, rectCell.y, rectCell.width, rectCell.height)
              .fillAndStroke(rowColor, 'black')
              .fillOpacity(1)
              .fillColor('black')
          }
        },
      })
    }

    if (limpezaTable.rows.length > 0) {
      doc.moveDown(15)
      await doc.table(limpezaTable, {
        width: 500,
        align: 'center',
        x: 50,
        columnSpacing: 2,
        divider: {
          header: {
            disabled: false,
            width: 1,
            opacity: 1,
          },
          horizontal: {
            disabled: false,
            width: 1,
            opacity: 0.5,
          },
        },
        prepareHeader: () => {
          doc.font('Helvetica-Bold').fillColor('black').fontSize(8)
        },
        prepareCell: (cell, row, column) => {
          const options = {
            align: 'center',
            valign: 'center',
            lineBreak: false,
            width: doc.widthOfString(cell),
            height: 10,
          }

          return options
        },
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          if (rectCell) {
            // Alternate row colors (fix for both even and odd rows)
            const rowColor = indexRow % 2 === 0 ? '#d9ecff' : '#b3d5f7'

            doc
              .rect(rectCell.x, rectCell.y, rectCell.width, rectCell.height)
              .fillAndStroke(rowColor, 'black')
              .fillOpacity(1)
              .fillColor('black')
          }
        },
      })
    }
  }
  if (contract === 'Lead Américas') {
    // Page setup and title section
    doc.registerFont('Segoe UI', './fonts/segoeuithibd.ttf')
    doc.addPage()
    doc
      .fontSize(28)
      .fillColor('#001233')
      .text('CHECKLIST ELEVADORES', { align: 'center' })
    function formatBlockNumber(bloco) {
      if (bloco === 'outros') {
        return 'PNE'
      }

      // Manually pad with zero for older JavaScript versions
      const paddedBloco = bloco.length === 1 ? '0' + bloco : bloco
      return `BL0${paddedBloco}`
    }
    // Function to generate consistent block colors before table rendering
    function generateBlockColors(addinfo) {
      const blockColors = {}
      const uniqueBlocks = [
        ...new Set(addinfo.map((elevador) => elevador.bloco)),
      ]

      uniqueBlocks.forEach((bloco, index) => {
        // Use a predefined palette of blue shades
        const bluePalette = [
          '#E6F2FF', // Very light blue
          '#B3D9FF', // Light blue
          '#80C1FF', // Medium light blue
          '#4DA6FF', // Medium blue
          '#1A8CFF', // Medium dark blue
          '#0073E6', // Dark blue
          '#005CB3', // Very dark blue
        ]

        // Cycle through the palette if we have more blocks than colors
        blockColors[bloco] = bluePalette[index % bluePalette.length]
      })

      return blockColors
    }
    // Define table structure
    const elevadorTable = {
      headers: [
        {
          label: 'ELEVADOR',
          property: 'elevadorFullName',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: 'BLOCO',
          property: 'bloco',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: 'CLASSE',
          property: 'classe',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: 'STATUS',
          property: 'status',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: 'INTERFONE',
          property: 'interfone',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: 'CÂMERAS',
          property: 'cameras',
          align: 'center',
          headerAlign: 'center',
        },
        {
          label: 'OBSERVAÇÃO',
          property: 'observacao',
          align: 'center',
          headerAlign: 'center',
        },
      ],
      rows: [],
      prepareHeader: () => doc.font('Helvetica-Bold'),
    }

    // Populate table rows
    const blockElevatorCounts = {}
    const blockInoperanteElevatorCounts = {}
    let prevbloco = null

    for (const elevador of addinfo) {
      // Set default values for empty fields
      elevador.observacao = elevador.observacao || '-'
      elevador.interfone = elevador.interfone || '-'
      elevador.cameras = elevador.cameras || '-'

      // Format block number
      elevador.bloco = formatBlockNumber(elevador.bloco)

      // Add separator row between different blocks
      if (prevbloco !== null && elevador.bloco !== prevbloco) {
        elevadorTable.rows.push(['', '', '', '', '', '', ''])
      }

      elevadorTable.rows.push([
        elevador.elevadorFullName,
        elevador.bloco,
        elevador.classe,
        elevador.status,
        elevador.interfone,
        elevador.cameras,
        elevador.observacao,
      ])

      prevbloco = elevador.bloco
      // Count both operante and inoperante elevators for each block
      if (elevador.status === 'Operante') {
        blockElevatorCounts[elevador.bloco] =
          (blockElevatorCounts[elevador.bloco] || 0) + 1
      } else if (elevador.status === 'Inoperante') {
        blockInoperanteElevatorCounts[elevador.bloco] =
          (blockInoperanteElevatorCounts[elevador.bloco] || 0) + 1
      }
    }

    // Generate block colors
    const blockColors = generateBlockColors(addinfo)

    // Render the table
    await doc.table(elevadorTable, {
      width: 500,
      align: 'center',
      x: 50,
      columnSpacing: 2,
      divider: {
        header: {
          disabled: false,
          width: 1,
          opacity: 1,
        },
        horizontal: { disabled: false, width: 1, opacity: 0.5 },
      },
      prepareHeader: () => {
        doc.font('Helvetica-Bold').fillColor('black').fontSize(8)
      },
      prepareCell: (cell, row, column) => {
        const options = {
          align: 'center',
          valign: 'center',
          lineBreak: false,
          width: doc.widthOfString(cell),
          height: 10,
        }

        return options
      },
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        // Existing block color logic
        if (rectCell) {
          const bloco = row[1]
          const blocColor = bloco ? blockColors[bloco] : 'white'

          doc
            .rect(rectCell.x, rectCell.y, rectCell.width, rectCell.height)
            .fillOpacity(0.3)
            .fillAndStroke(blocColor, 'black')
            .fillOpacity(1)
            .fillColor('black')
        }
        if (indexRow > 0) {
          const currentBloco = row[1]
          const previousBloco = elevadorTable.rows[indexRow - 1][1]

          if (currentBloco !== previousBloco) {
            // Color the entire separator row
            if (row[0] === '' && row[1] === '' && row[2] === '') {
              doc
                .fillOpacity(0.2)
                .fillColor('#0047AB')
                .rect(rectRow.x, rectRow.y, rectRow.width, rectRow.height)
                .fill()
                .fillOpacity(1)
            }
          }
        }
        // Existing block separator logic
        if (indexColumn === 0 && indexRow > 0) {
          const currentBloco = row[1]
          const previousBloco = elevadorTable.rows[indexRow - 1][1]

          if (currentBloco !== previousBloco) {
            doc
              .fillColor('#0047AB')
              .rect(rectRow.x, rectRow.y - 2, rectRow.width, 2)
              .fill()
            doc.fillColor('black')
          }
        }
      },
    })
    doc.addPage()
    doc.moveDown(13)
    // Bar chart with improved styling
    const chartX = 50
    const chartY = doc.y + 50
    const barWidth = 70
    const barSpacing = 20
    const chartHeight = 250

    // Calculate max value for scaling the chart
    const allCounts = [
      ...Object.values(blockElevatorCounts),
      ...Object.values(blockInoperanteElevatorCounts),
    ]
    const maxValue = Math.max(...allCounts, 1)

    // Chart title with more emphasis
    doc
      .fontSize(16)
      .fillColor('#001233')
      .font('Helvetica-Bold')
      .text('Elevadores por Bloco', chartX, chartY - 40, { align: 'center' })

    // Add a more distinct legend
    const legendY = chartY + chartHeight + 25
    doc.fontSize(10).fillColor('#000000').font('Helvetica')

    doc.rect(chartX, legendY, 15, 15).fillColor('#0047ab').fill()
    doc.text('Operante', chartX + 20, legendY + 2)

    doc
      .rect(chartX + 100, legendY, 15, 15)
      .fillColor('#999999')
      .fill()
    doc.text('Inoperante', chartX + 120, legendY + 2)

    // Draw bars with improved visual hierarchy
    let currentX = chartX
    const allBlocks = new Set([
      ...Object.keys(blockElevatorCounts),
      ...Object.keys(blockInoperanteElevatorCounts),
    ])

    for (const block of allBlocks) {
      const operanteCount = blockElevatorCounts[block] || 0
      const inoperanteCount = blockInoperanteElevatorCounts[block] || 0

      // Draw operante bar with gradient and shadow effect
      if (operanteCount > 0) {
        const barHeight = (operanteCount / maxValue) * chartHeight
        doc
          .fillColor('#0047ab')
          .opacity(0.8)
          .rect(
            currentX,
            chartY + chartHeight - barHeight,
            barWidth / 2,
            barHeight,
          )
          .fill()

        doc
          .fillColor('#000000')
          .opacity(1)
          .fontSize(9)
          .text(
            operanteCount.toString(),
            currentX,
            chartY + chartHeight - barHeight - 15,
            {
              width: barWidth / 2,
              align: 'center',
            },
          )
      }

      // Draw inoperante bar with gradient and shadow effect
      if (inoperanteCount > 0) {
        const barHeight = (inoperanteCount / maxValue) * chartHeight
        doc
          .fillColor('#999999')
          .opacity(0.8)
          .rect(
            currentX + barWidth / 2,
            chartY + chartHeight - barHeight,
            barWidth / 2,
            barHeight,
          )
          .fill()

        doc
          .fillColor('#000000')
          .opacity(1)
          .fontSize(9)
          .text(
            inoperanteCount.toString(),
            currentX + barWidth / 2,
            chartY + chartHeight - barHeight - 15,
            {
              width: barWidth / 2,
              align: 'center',
            },
          )
      }

      // Block label with improved typography
      doc
        .fillColor('#333333')
        .fontSize(10)
        .text(block, currentX, chartY + chartHeight + 5, {
          width: barWidth,
          align: 'center',
        })

      currentX += barWidth + barSpacing
    }
  }
  if (contract === 'Union Square') {
    // Constants for layout
    const imageMargin = 20;
    const imageWidth = 90;
  
    // Ensure unionTableEntries has the right structure
    const entriesByBloco = unionTableEntries.reduce((acc, entry) => {
      const blocoKey = entry.bloco;
  
      if (!acc[blocoKey]) {
        acc[blocoKey] = [];
      }
      acc[blocoKey].push(entry);
      return acc;
    }, {});
  
    // Sort entries by time within each bloco
    Object.values(entriesByBloco).forEach((entries) => {
      entries.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );
    });
  
    // Process each bloco - only create pages for blocos that have images
    for (const [bloco, entries] of Object.entries(entriesByBloco)) {
      // Filter entries to ensure they have images
      const entriesWithImages = entries.filter(
        (entry) => entry.images && entry.images.length > 0,
      );
  
      if (entriesWithImages.length === 0) {
        continue; // Skip blocos with no images
      }
  
      // Get bloco number from the string (e.g., "bloco1" -> "1")
      const blocoNumber = bloco.replace(/\D/g, '');
  
      // Add new page for this bloco
      doc.addPage();
  
      // Initialize positioning for images
      let x = imageMargin;
      let y = imageWidth;
  
      // Add page title
      doc
        .fontSize(28)
        .fill('#001233')
        .text(`RELATÓRIO FOTOGRÁFICO BL${blocoNumber}`, 40, 30, {
          align: 'center',
        });
  
      // Process all images from entries
      let imageIndex = 0;
  
      for (const entry of entriesWithImages) {
        if (entry.images && entry.images.length > 0) {
          for (const image of entry.images) {
            // Create image description
            let timeStr = entry.time.toString();
            timeStr = timeStr.split('Z');
            let imageDesc;
            if (entry.observation) {
              imageDesc = `${timeStr[0]}: ${entry.observation}`;
            } else {
              imageDesc = timeStr[0];
            }
  
            // Check if we need a new page for this bloco
            if (imageIndex > 0 && imageIndex % 9 === 0) {
              doc.addPage();
              doc
                .fontSize(28)
                .fill('#001233')
                .text(`RELATORIO FOTOGRAFICO BL${blocoNumber}`, 40, 30, {
                  align: 'center',
                });
              x = imageMargin;
              y = imageWidth;
            }
  
            try {
              // Convert base64 to Buffer
              const imageBuffer = Buffer.from(image.data, 'base64');
  
              // Compress the image
              const compressedImageBuffer = await compressImage(
                imageBuffer.toString('base64'),
                150, // Target width
                150, // Target height
              );
  
              // Add compressed image
              doc.image(compressedImageBuffer, x, y, { width: 150, height: 150 });
  
              // Add blue rectangle with description
              doc.rect(x, y + 150, 150, 70).fill('#007bff');
  
              // Add description text
              doc
                .fontSize(10)
                .fill('#fff')
                .text(imageDesc, x + 5, y + 155, { width: 140 });
  
              // Update positioning
              x += 200;
  
              // Move to next row if needed
              if ((imageIndex + 1) % 3 === 0) {
                x = imageMargin;
                y += 230;
              }
  
              imageIndex++;
            } catch (error) {
              console.error('Error adding image to PDF:', error, image);
              continue;
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
    if(ocurrences.length > 0) {
      const table: {
      title: string
      headers: { label: string; align: string; headerAlign: string }[]
      rows: string[][]
    } = {
      headers: [
        { label: 'HORÁRIO', align: 'center', headerAlign: 'center' },
        { label: 'LOCAL', align: 'center', headerAlign: 'center' },
        { label: 'OBSEV', align: 'center', headerAlign: 'center' },
      ],
      
      rows: ocurrences.map((ocurrence) => [
        extractTimeFromISO(ocurrence.horario) || '',
        ocurrence.local || '',
        ocurrence.observacao || '',
      ]),
      prepareHeader: () => doc.font('Helvetica-Bold'),
    }
    await doc.table(table, {
      width: 500,
      align: 'center',
      x: 50,
      columnSpacing: 2,
      divider: {
        header: {
          disabled: false,
          width: 1,
          opacity: 1,
        },
        horizontal: {
          disabled: false,
          width: 1,
          opacity: 0.5,
        },
      },
      prepareHeader: () => {
        doc.font('Helvetica-Bold').fillColor('black').fontSize(8)
      },
      prepareCell: (cell, row, column) => {
        const options = {
          align: 'center',
          valign: 'center',
          lineBreak: false,
          width: doc.widthOfString(cell),
          height: 10,
        }

        return options
      },
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        if (rectCell) {
          // Alternate row colors (fix for both even and odd rows)
          const rowColor = indexRow % 2 === 0 ? '#d9ecff' : '#b3d5f7'

          doc
            .rect(rectCell.x, rectCell.y, rectCell.width, rectCell.height)
            .fillAndStroke(rowColor, 'black')
            .fillOpacity(1)
            .fillColor('black')
        }
      },
    })
    //Se false escreva um texto no meio da pagina centralizado
    }else {
      doc
        .fontSize(15)
        .fill('#001233')
        .text(
          'Nenhuma ocorrência da Policia Militar no dia de hoje.',
          100,
          200,
          { lineGap: 10 },
        )
    }
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

  // Finalize o arquivo e salve na pasta
  const filedate = formatDateForFilename(relatorioData)
  // Se não houver pasta crie uma recursivamente
  const gendocsPath = path.join(__dirname, '/', 'gendocs')
  if (!fs.existsSync(gendocsPath)) {
    fs.mkdirSync(gendocsPath, { recursive: true })
  }
  
  // Nome do arquivo
  const filePath = `${gendocsPath}/Relatorio ${contract} ${filedate} ${dutyid}.pdf`
  
  // Resetando variável global
  unionTableEntries = []
  
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

// Função para comprimir o PDF usando pdf-lib
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

export async function sendPdf(request: FastifyRequest, reply: FastifyReply) {
  try {
     // Extract parameters from the request
    const { id, contract, data_inicio, token } = request.query as {
      id: string
      contract: string
      data_inicio: string
      token?: string
    }
    // Validate required parameters
    lockAcquired = false
    console.log(id, contract, data_inicio, token)
    if (!id || !contract || !data_inicio) {
      console.log("Missing required parameters")
      return reply.code(400).send({
        error: 'Bad Request',
        message:
          'Missing required parameters: id, contract, and data_inicio are all required',
      })
    }
    // Reuse the getPdfReport logic to handle file retrieval and streaming
    const created_at = data_inicio
    return await getPdfReport(
      {
        params: { id },
        query: { contract, created_at, token },
      } as unknown as FastifyRequest,
      reply,
    )
  } catch (error) {
    console.error('Error sending PDF:', error)
    return reply.status(500).send({ message: 'Failed to send PDF.' })
  }
}
