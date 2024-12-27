import { FastifyReply, FastifyRequest } from 'fastify'

export interface QueueItem {
  request: FastifyRequest
  reply: FastifyReply
}

export const queue: QueueItem[] = []

export function enqueue(request: FastifyRequest, reply: FastifyReply) {
  queue.push({ request, reply })
}

export function dequeue() {
  const { request, reply } = queue.shift() || {}
  return { request, reply }
}

export function isEmpty() {
  return queue.length === 0
}
