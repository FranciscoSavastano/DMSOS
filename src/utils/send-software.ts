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
      const ver = '1.0.3'
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
  /**
 * Serves application update files (latest.yml and .exe installers).
 * This endpoint is designed for electron-updater's 'generic' provider.
 */
export async function getSoftwareUpdates(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Determine the requested file based on the URL parameter
    // electron-updater will append the filename to the base URL
    // e.g., if base is /v1/software/, it will request /v1/software/latest.yml
    const requestedFilename = request.params.filename as string | undefined // Assuming you use a route like /v1/software/:filename

    // Base directory where your built software releases are stored
    // This should point to where you upload the output of electron-builder (e.g., 'dist' folder contents)
    const releasesPath = path.join(__dirname, '/../', 'public', 'software')

    if (!requestedFilename) {
      // This path is hit if someone accesses /v1/software/ directly without a filename.
      // For backward compatibility, you might serve a default file or an error.
      // For electron-updater, this scenario typically won't happen.
      // Let's assume for now, it's an invalid request for the updater.
      request.log.warn('Access to /v1/software/ without a specific filename requested by updater.')
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Please specify a file to download (e.g., latest.yml or installer.exe).'
      })
    }

    const filePath = path.join(releasesPath, requestedFilename)

    // Security check: Prevent directory traversal attacks
    if (path.relative(releasesPath, filePath).startsWith('..')) {
      request.log.error(`Attempted directory traversal: ${filePath}`)
      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Invalid file path requested.'
      })
    }

    // Check if the file exists
    const fileExists = await exists(filePath)
    if (!fileExists) {
      request.log.error(`File not found for update: ${filePath}`)
      return reply.code(404).send({
        error: 'Not Found',
        message: `The requested file (${requestedFilename}) was not found.`
      })
    }

    // Determine Content-Type based on file extension
    let contentType: string
    if (requestedFilename.endsWith('.yml') || requestedFilename.endsWith('.yaml')) {
      contentType = 'text/yaml'
    } else if (requestedFilename.endsWith('.exe')) {
      contentType = 'application/vnd.microsoft.portable-executable'
    } else if (requestedFilename.endsWith('.blockmap')) {
      contentType = 'application/octet-stream' // Blockmap files are binary
    }
    // Add other file types like .dmg, .zip, .AppImage if you support macOS/Linux updates
    else {
      // Fallback for unknown types (e.g., if you have other update artifacts)
      contentType = 'application/octet-stream'
    }

    reply.header('Content-Type', contentType)
    reply.header('Content-Disposition', `attachment; filename="${requestedFilename}"`)
    // No need for 'Content-Custom-Header', as it's not standard and might cause confusion.

    // Stream the file to the client
    const fileStream = fs.createReadStream(filePath)

    fileStream.on('error', (err) => {
      request.log.error(`Error streaming update file ${requestedFilename}: ${err.message}`)
      if (!reply.sent) { // Prevent setting headers after they've been sent
        reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to read the update file.'
        })
      }
    })

    return reply.send(fileStream)

  } catch (error) {
    request.log.error(`Error in getSoftwareUpdates: ${error}`)
    console.error(error) // Log to console for development visibility
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing the update request.'
    })
  }
}