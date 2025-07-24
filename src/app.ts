import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
  port?: number
}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  port: 3011
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  // Process-level error handlers for comprehensive error coverage
  // Based on log analysis: Original error occurred during normal operation with stable system
  process.on('uncaughtException', (error) => {
    fastify.log.fatal({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      runtime: {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        pid: process.pid,
        uptime: process.uptime()
      },
      severity: 'critical',
      tags: ['process', 'uncaught-exception']
    }, 'Uncaught exception - process will exit')
    
    // Graceful shutdown
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    fastify.log.error({
      error: reason,
      promise: promise.toString(),
      runtime: {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        pid: process.pid
      },
      severity: 'high',
      tags: ['process', 'unhandled-rejection']
    }, 'Unhandled promise rejection')
  })

  // Global error handler - handles all route-level unhandled errors
  // This addresses the original exception that wasn't properly caught
  fastify.setErrorHandler(async (error, request, reply) => {
    // Log detailed error information including runtime context
    fastify.log.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        params: request.params,
        query: request.query
      },
      runtime: {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        pid: process.pid,
        nodeVersion: process.version,
        uptime: process.uptime()
      },
      severity: 'high',
      tags: ['fastify', 'api-error']
    }, 'Unhandled error occurred')

    // Set appropriate status code
    const statusCode = error.statusCode || 500
    
    // Return structured error response
    reply.status(statusCode).send({
      error: error.name || 'Internal Server Error',
      message: statusCode === 500 
        ? 'An internal server error occurred' // Don't expose internal error details in production
        : error.message,
      statusCode,
      timestamp: new Date().toISOString()
    })
  })

  // Register Swagger
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Test Fastify API',
        description: 'Demo API with Swagger documentation',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3011',
          description: 'Development server'
        }
      ]
    }
  })

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app, options }
