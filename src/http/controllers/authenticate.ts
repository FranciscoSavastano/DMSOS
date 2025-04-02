import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'
import { makeAuthenticateCustomerUseCase } from '@/use-cases/factories/make-authenticate-customer-use-case'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { type FastifyRequest, type FastifyReply } from 'fastify'
import { z } from 'zod'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
    })
    .parse(request.body)

  const { email, password } = authenticateBodySchema
  const { ip: ipAddress } = request
  const { 'user-agent': browser } = request.headers
  const { remotePort } = request.socket

  const browserName = Array.isArray(browser) ? browser[0] : browser

  try {
    // Try to authenticate as a regular user first
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({
      email,
      password,
      ipAddress,
      browser: browserName,
      remotePort: `${remotePort}`,
    })

    const accessToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user?.id,
          expiresIn: '4h',
        },
      },
    )

    const refreshToken = await reply.jwtSign(
      {},
      {
        sign: {
          sub: user?.id,
          expiresIn: '7d',
        },
      },
    )

    return await reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({ user, accessToken })
  } catch (err: unknown) {
    console.log('Regular user auth failed, trying customer auth:', err)
    
    try {
      // Try to authenticate as a customer
      const authenticateCustomerUseCase = makeAuthenticateCustomerUseCase()

      const { user } = await authenticateCustomerUseCase.execute({
        email,
        password,
        ipAddress,
        browser: browserName,
        remotePort: `${remotePort}`,
      })

      const accessToken = await reply.jwtSign(
        {},
        {
          sign: {
            sub: user?.id,
            expiresIn: '4h',
          },
        },
      )

      const refreshToken = await reply.jwtSign(
        {},
        {
          sign: {
            sub: user?.id,
            expiresIn: '7d',
          },
        },
      )

      return await reply
        .setCookie('refreshToken', refreshToken, {
          path: '/',
          secure: true,
          sameSite: true,
          httpOnly: true,
        })
        .status(200)
        .send({ user, accessToken })
    } catch (customerErr) {
      console.log('Customer auth also failed:', customerErr)
      
      // If both authentications fail with invalid credentials
      if (err instanceof InvalidCredentialsError || customerErr instanceof InvalidCredentialsError) {
        return await reply.status(400).send({ message: 'Invalid credentials' })
      }

      // For other errors
      throw customerErr
    }
  }
}