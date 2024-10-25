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
  var options = {
    format: 'A3',
    orientation: 'portrait',
    border: '10mm',
    header: {
      height: '45mm',
      contents: '<div style="text-align: center;">DMSYS</div>',
    },
    footer: {
      height: '28mm',
      contents: {
        first: 'Cover page',
        2: 'Second page', // Any page number is working. 1-based index
        default:
          '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        last: 'Last Page',
      },
    },
  }
  var document = {
    html: html,
    data: {
      users: users,
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
