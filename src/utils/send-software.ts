import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { FastifyRequest, FastifyReply } from 'fastify'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'

// Convert fs.exists to promise-based
const exists = promisify(fs.exists)

  /**
   * Retrieves and serves a Setup file based on report details
   */
  export async function getSetupFile(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const ver = '1.0.0'
      // Parse and format the date for filename
      try {
        
        // Construct path to the gendocs directory
        const setupPath = path.join(__dirname, '/../', 'public', 'software')
        // Create the exact filename based on your pattern
        const fileName = `DMSYS Setup ${ver}.exe`
        const filePath = path.join(setupPath, fileName)
        
        // Check if the file exists
        const fileExists = await exists(filePath)
        if (!fileExists) {
          request.log.error(`Setup não encontrado: ${filePath}`)
          return reply.code(404).send({
            error: 'Not Found',
            message: 'O arquivo de instalação não foi encontrado'
          })
        }
        
        // Set appropriate headers for .exe file download
        reply.header('Content-Type', 'application/vnd.microsoft.portable-executable')
        reply.header('Content-Length', fs.statSync(filePath).size)
        reply.header('Content-Disposition', `attachment; filename="${fileName}"`)
        reply.header('Content-Custom-Header', `attachment; filename="${fileName}"`)
        
        // Stream the file to the client
        const fileStream = fs.createReadStream(filePath)
        
        // Handle potential stream errors
        fileStream.on('error', (err) => {
          request.log.error(`Error streaming the setup: ${err.message}`)
          if (!reply.sent) {
            reply.code(500).send({
              error: 'Internal Server Error',
              message: 'Failed to read the setup file'
            })
          }
        })
        
        return reply.send(fileStream)
        
      } catch (error) {
        request.log.error(`Error processing setup download request: ${error}`)
        console.log(error)
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'An error occurred while processing your request'
        })
      }
      
    } catch (error) {
      request.log.error(`Setup retrieval error: ${error}`)
      console.log(error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request'
      })
    }
  }