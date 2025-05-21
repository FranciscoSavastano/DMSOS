import type { UsersRepository } from '@/repositories/users-repository'
import type { CustomerRepository } from '@/repositories/customers-repository'
import { hash } from 'bcryptjs'
import fs from 'fs'
import { UserAlreadyExistsError } from './errors/user-already-exists'
import type { Cliente, User } from '@prisma/client'
import { CustomerAlreadyExistsError } from './errors/customer-already-exists'
import { UserCpfAlreadyExistsError } from './errors/user-cpf-already-exists'
import { CustomerCnpjAlreadyExistsError } from './errors/cust-cnpj-already-exists'
import { invalid } from 'moment-timezone'
import { InvalidCpf } from './errors/invalid-cpf'
import { InvalidCnpj } from './errors/invalid-cnpj'
import { NOMEM } from 'dns'
import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { sendEmail } from '@/utils/send-email'
import path from 'path'
import { content } from 'pdfkit/js/page'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

interface RegisterUseCaseRequest {
  nome: string
  email: string
  cpf: string
  password?: string
  user_role: string
  contrato?: string
}

interface RegisterUseCaseResponse {
  user: User
}

interface RegisterUseCaseCustRequest {
  nome: string
  email: string
  cnpj: string
  password: string
  telefone?: string
  responsavel?: string
  endereco?: string
}

interface RegisterUseCaseCustResponse {
  user: Cliente
}
export function generateRandomPassword() {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '@#$%&*!?';
  
  // Combine all character types
  const allChars = uppercase + lowercase + numbers + specialChars;
  
  let password = '';
  
  // Ensure at least one of each type of character
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Fill the rest of the password
  for (let i = 4; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
async function sendRegisterEmail(emailto: string, nome: string, senha: string, tipo: string, contrato?: string) {
let baseDir;
if (process.env.NODE_ENV === 'production') {
  baseDir = path.join(process.cwd(), 'public', 'assets');
} else {
  baseDir = path.join(process.cwd(), 'public', 'assets');
}
  console.log("Cadastro com sucesso, enviando email para: ", emailto)
  // Only create file streams when needed to avoid them being consumed prematurely
  if (tipo !== "Cliente") {
    const subject = "Acesso à Plataforma DMSYS";
    const message = `Prezado(a) ${nome},\n\nSeja bem-vindo(a) à Plataforma DMSYS!\n\nPara garantir a segurança da sua conta, a troca da senha inicial é obrigatória no primeiro acesso. Utilize as seguintes informações para logar:\n\n* E-mail: ${emailto} | Senha inicial: ${senha}\n\nAo acessar a plataforma, você será automaticamente direcionado(a) para a página de alteração de senha.\n\nCaso enfrente qualquer dificuldade ou precise de assistência, entre em contato com nossa equipe de suporte através do e-mail suporte@dmsys.com.br ou pelo telefone (21) 3442-2839.\n\nAtenciosamente,\n\nEquipe DMSYS`;

    if (tipo === "Operador") {
      let anexo = [];
      
      // Add the manual PDF
      const manualPath = path.join(baseDir, 'Manual RDO.pdf');
      anexo.push({
        filename: "Manual RDO.pdf",
        content: fs.createReadStream(manualPath),
        contentType: 'application/pdf'
      });
      
      // Add the rules and conduct PDF
      const condutaPath = path.join(baseDir, 'NORMAS.pdf');
      anexo.push({
        filename: "Regras e condutas.pdf",
        content: fs.createReadStream(condutaPath),
        contentType: 'application/pdf'
      });
      
      // Add contract-specific PDFs if needed
      if (contrato === "Centro Metropolitano / Union Square") {
        const popPath = path.join(baseDir, 'POP-TODOS.pdf');
        
        anexo.push({
          filename: "Procedimentos Operacionais.pdf",
          content: fs.createReadStream(popPath),
          contentType: 'application/pdf'
        });
      }
      
      await sendEmail({
        to: emailto,
        subject: subject,
        message: message,
        attachments: anexo
      });
    } else {
      // For non-Operator, non-Client users
      const condutaPath = path.join(baseDir, 'NORMAS.pdf');
      
      await sendEmail({
        to: emailto,
        subject: subject,
        message: message,
        attachments: [
          {
            filename: "Regras e condutas.pdf",
            content: fs.createReadStream(condutaPath),
            contentType: 'application/pdf'
          }
        ]
      });
    }
  }
  // Note: No explicit action for "Cliente" type
}


export class RegisterUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    nome,
    cpf,
    email,
    user_role,
    contrato,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email)
    const userWithSameCpf = await this.usersRepository.findByCpf(cpf)
    if (userWithSameEmail != null) {
      throw new UserAlreadyExistsError()
    }
    if (userWithSameCpf != null) {
      throw new UserCpfAlreadyExistsError()
    }

    //Calcular o primeiro digito validador do cpf
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }
    if (remainder !== parseInt(cpf.charAt(9))) {
      throw new InvalidCpf()
    }

    // Calcular o segundo digito validador
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }
    if (remainder !== parseInt(cpf.charAt(10))) {
      throw new InvalidCpf()
    }
    const password = generateRandomPassword()
    const passwordDigest = await hash(password, 10)

    const user = await this.usersRepository.create({
      nome,
      cpf,
      email,
      password_digest: passwordDigest,
      user_role,
      contrato,
    })
    //Envie email com o acesso temporario
    sendRegisterEmail(email, nome, password, user_role, contrato)
    return {
      user,
    }
  }
}
export class RegisterCustUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({
    nome,
    responsavel,
    telefone,
    email,
    endereco,
    cnpj,
    services,
  }: RegisterUseCaseCustRequest): Promise<RegisterUseCaseCustResponse> {
    const custWithSameEmail = await this.customerRepository.findByEmail(email)
    const userWithSameCnpj = await this.customerRepository.findByCnpj(cnpj)

    if (custWithSameEmail != null) {
      throw new CustomerAlreadyExistsError()
    }

    //if (userWithSameEmail != null) {
    //  throw new UserAlreadyExistsError()
    //}

    if (userWithSameCnpj != null) {
      throw new CustomerCnpjAlreadyExistsError()
    }

    cnpj = cnpj.replace(/\D+/g, '')

    // Verifica se o CNPJ possui 14 dígitos
    if (cnpj.length !== 14) {
      throw new InvalidCnpj()
    }

    // Verifica se o CNPJ é composto apenas por números iguais
    if (/^(\d)\1{13}$/.test(cnpj)) {
      throw new InvalidCnpj()
    }

    // Calcula o primeiro dígito verificador
    let sum = 0
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i]
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }
    if (remainder !== parseInt(cnpj.charAt(12))) {
      throw new InvalidCnpj()
    }

    // Calcula o segundo dígito verificador
    sum = 0
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i]
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }
    if (remainder !== parseInt(cnpj.charAt(13))) {
      throw new InvalidCnpj()
    }

    const password = generateRandomPassword()
    const passwordDigest = await hash(password, 10)

    const user = await this.customerRepository.create({
      nome,
      responsavel,
      telefone,
      endereco,
      email,
      cnpj,
      password_digest: passwordDigest,
      services,
    })
    //Envie email com o acesso temporario
    sendRegisterEmail(email, nome, password, "Cliente")
    return {
      user,
    }
  }
}
