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

  // Global error handler for schema validation errors
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error({
      error: error.message,
      statusCode: error.statusCode,
      url: request.url,
      method: request.method,
      body: request.body,
      timestamp: new Date().toISOString(),
      stack: error.stack,
      context: 'global_error_handler'
    }, 'Request processing error')

    // Handle schema validation errors specifically
    if (error.statusCode === 400 && error.message.includes("must have required property")) {
      const missingProperty = error.message.match(/'([^']+)'/)?.[1]
      
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Request validation failed',
        details: {
          issue: `Missing required property: ${missingProperty}`,
          hint: missingProperty === 'name' ? 'Check if you accidentally sent "named" instead of "name"' : undefined,
          receivedBody: request.body
        }
      })
    }

    // Default error response
    reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    })
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
