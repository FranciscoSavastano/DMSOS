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
  const contract = duty.contrato
  const dataformatada = formatarData(duty.created_at)
  const periodo = determinePeriod(duty.created_at)
  const pdf = require('pdf-creator-node')
  var html = fs.readFileSync('./src/utils/pdf-model copy.html', 'utf8')

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
  var images = {
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
  var options = {
    format: 'A4',
    orientation: 'portrait',
  }
  var document = {
    html: html,
    data: {
      users,
      images: images,
      data,
      periodo,
      dataformatada,
      contract
    },
    path: './src/gendocs/output' + ' ' + duty.id + '.pdf',
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
