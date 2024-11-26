import 'pdf-creator-node'
import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'
import { prisma } from '@/lib/prisma'
import { FastifyRequest, FastifyReply } from 'fastify'
import { Multipart } from '@fastify/multipart'
import { pipeline } from 'node:stream/promises'
var isready = false
var document
var options
var images
var pdf
var canwrite = false
var anexpath = []
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

    const base64Image = `data:${file.mimetype};base64,${buffer.toString('base64')}`
    fileData.push(base64Image) // Store only the Base64 string
  }

  // Write the file data to the temporary file
  fs.writeFileSync(tempFilePath, fileData.join('\n'))
  canwrite = true
  return reply.send({ message: 'Files uploaded successfully' })
}

function generatepdf(document, options) {
  if (canwrite) {
    console.log('escrevendo')
    pdf = require('pdf-creator-node')
    pdf
      .create(document, options)
      .then((res: any) => {
        console.log(res)
      })
      .catch((error: any) => {
        console.error(error)
      })
  } else {
    console.log('nao permitido escrever')
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
  const tempFilePath = path.join(__dirname, 'temp_anexpath.txt')
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
  var html = fs.readFileSync('./src/utils/pdf-model.html', 'utf8')

  var logoB64Content = fs.readFileSync('./src/utils/pdf-img/com-image.png', {
    encoding: 'base64',
  })
  const comercialImage = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/fade-logo.png', {
    encoding: 'base64',
  })
  const fadelogo = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/logo-simple.png', {
    encoding: 'base64',
  })
  const simplelogo = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/tech-border.png', {
    encoding: 'base64',
  })
  const techborder = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/border-cover.png', {
    encoding: 'base64',
  })
  const bordercover = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/tech-border2.png', {
    encoding: 'base64',
  })
  const techborderalt = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/circle1.png', {
    encoding: 'base64',
  })
  const circle1 = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/circle2.png', {
    encoding: 'base64',
  })
  const circle2 = 'data:image/jpeg;base64,' + logoB64Content
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/blue-border.png', {
    encoding: 'base64',
  })
  const blueborder = 'data:image/jpeg;base64,' + logoB64Content
  const anexpath = fs.readFileSync(tempFilePath, 'utf-8').split('\n')

  images = {
    comercialImage,
    fadelogo,
    simplelogo,
    techborder,
    bordercover,
    techborderalt,
    circle1,
    circle2,
    blueborder,
  }
  options = {
    format: 'A4',
    orientation: 'portrait',
  }
  document = {
    html: html,
    data: {
      users,
      images: images,
      anexpath,
      data,
      periodo,
      dataformatada,
      contract,
      ocurrence,
    },
    path: './src/gendocs/output' + ' ' + duty.id + '.pdf',
    type: '',
  }
  generatepdf(document, options)
}
