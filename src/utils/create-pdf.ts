import 'pdf-creator-node'
import fs from 'fs'

export async function CreatePdf() {
  const pdf = require('pdf-creator-node')
  var html = fs.readFileSync('./src/utils/pdf-model.html', 'utf8')
  var users = [
    {
      nome: 'Francisco',
      user_role: 'Tecnico',
    },
    {
      nome: 'Sheldon',
      user_role: 'Operador',
    },
    {
      nome: 'Bruno',
      user_role: 'Comercial',
    },
  ]
  var logoB64Content = fs.readFileSync('./src/utils/pdf-img/com-image.png', {encoding: 'base64'});
  const comercialImage = "data:image/jpeg;base64,"+logoB64Content;
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/fade-logo.png', {encoding: 'base64'});
  const fadelogo = "data:image/jpeg;base64,"+logoB64Content;
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/logo-simple.png', {encoding: 'base64'});
  const simplelogo = "data:image/jpeg;base64,"+logoB64Content;
  logoB64Content = fs.readFileSync('./src/utils/pdf-img/tech-border.png', {encoding: 'base64'});
  const techborder = "data:image/jpeg;base64,"+logoB64Content;

  var images = 
    {
      comercialImage,
      fadelogo,
      simplelogo,
      techborder
    }
  var options = {
    format: 'A4',
    orientation: 'portrait',
    border: '10mm',
  }
  var document = {
    html: html,
    data: {
      users: users,
      images: images,

    },
    path: './output.pdf',
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
