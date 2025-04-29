import { InvalidJwtTokenError } from '@/use-cases/errors/invalid-jwt-token-error'
import { FastifyRequest, FastifyReply } from 'fastify'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { verify } from 'jsonwebtoken'
import env from '@/config/env'

// Convert fs.exists to promise-based
const exists = promisify(fs.exists)

// Define interface for the request params
interface PDFRequestParams {
    id: string
  }
  
  // Define interface for the request query
  interface PDFRequestQuery {
    contract: string
    created_at: string
    token?: string
  }
  
  /**
   * Retrieves and serves a PDF file based on report details
   */
  export async function getPdfReport(
    request: FastifyRequest<{
      Params: PDFRequestParams,
      Querystring: PDFRequestQuery
    }>,
    reply: FastifyReply
  ) {
    try {
      // Extract parameters from request
      const { id } = request.params
      const { contract, created_at, token } = request.query
      // Validate required parameters
      if (!id || !contract || !created_at) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Missing required parameters: id, contract, and created_at are all required'
        })
      }
          let token_payload: { sub: string }
          try {
            token_payload = verify(token, env.JWT_SECRET) as { sub: string }
         } catch (error) {
            console.log(error)
            throw new InvalidJwtTokenError()
          }
      
      // Parse and format the date for filename
      try {
        const date = new Date(created_at)
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format')
        }
        
        // Format the date as DD-MM-YYYY to match your file naming convention
        const filedate = `${date.getDate().toString().padStart(2, '0')}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getFullYear()}`
        // Construct path to the gendocs directory
        const gendocsPath = path.join(__dirname, '/../', 'build', 'gendocs')
        // Create the exact filename based on your pattern
        const fileName = `Relatorio ${contract} ${filedate} ${id}.pdf`
        const filePath = path.join(gendocsPath, fileName)
        
        // Check if the file exists
        const fileExists = await exists(filePath)
        if (!fileExists) {
          request.log.error(`PDF file not found: ${filePath}`)
          return reply.code(404).send({
            error: 'Not Found',
            message: 'The requested PDF report could not be found'
          })
        }
        
        // Set appropriate headers for PDF viewing
        reply.header('Content-Type', 'application/pdf')
        reply.header('Content-Disposition', `inline; filename="Relatorio ${contract} ${filedate} ${id}.pdf"`)
        
        // Stream the file to the client
        const fileStream = fs.createReadStream(filePath)
        
        // Handle potential stream errors
        fileStream.on('error', (err) => {
          request.log.error(`Error streaming PDF: ${err.message}`)
          if (!reply.sent) {
            reply.code(500).send({
              error: 'Internal Server Error',
              message: 'Failed to read the PDF file'
            })
          }
        })
        
        return reply.send(fileStream)
        
      } catch (dateError) {
        request.log.error(`Date parsing error: ${dateError}`)
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Invalid date format in created_at parameter'
        })
      }
      
    } catch (error) {
      request.log.error(`PDF retrieval error: ${error}`)
      console.log(error)
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'An error occurred while processing your request'
      })
    }
  }