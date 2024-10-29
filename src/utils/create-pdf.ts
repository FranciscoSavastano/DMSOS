import 'pdf-creator-node'
import fs from 'fs'
import moment from 'moment-timezone'
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
  const dataformatada = formatarData(duty.created_at)
  const periodo = determinePeriod(duty.created_at)
  const pdf = require('pdf-creator-node')
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

  var images = {
    comercialImage,
    fadelogo,
    simplelogo,
    techborder,
  }
  var options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
  }
  var document = {
    html: html,
    data: {
      users,
      images: images,
      data,
      periodo,
      dataformatada,
    },
    path: './src/gendocs/output' + duty.id + '.pdf',
    type: '',
  }
  pdf
    .create(document, options)
    .then((res: any) => {
      console.log(res)
    })
    .catch((error: any) => {
      console.error(error)
    })
}
