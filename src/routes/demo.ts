import { FastifyPluginAsync } from 'fastify'

interface User {
  id: number
  name: string
  email: string
  age: number
}

interface Product {
  id: number
  name: string
  price: number
  category: string
}

const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  }
}

const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' }
  }
}

const demo: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/users', {
    schema: {
      description: 'Get all users',
      tags: ['users'],
      response: {
        200: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: userSchema
            }
          }
        }
      }
    }
  }, async function (request, reply) {
    const users: User[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
    ]
    return { users }
  })

  fastify.get('/products', {
    schema: {
      description: 'Get all products',
      tags: ['products'],
      response: {
        200: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: productSchema
            }
          }
        }
      }
    }
  }, async function (request, reply) {
    const products: Product[] = [
      { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
      { id: 2, name: 'Coffee Mug', price: 12.99, category: 'Kitchen' },
      { id: 3, name: 'Book', price: 19.99, category: 'Education' }
    ]
    return { products }
  })

  fastify.get('/stats', {
    schema: {
      description: 'Get application statistics',
      tags: ['stats'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalUsers: { type: 'number' },
            totalOrders: { type: 'number' },
            revenue: { type: 'number' },
            growth: { type: 'number' }
          }
        }
      }
    }
  }, async function (request, reply) {
    return {
      totalUsers: 1250,
      totalOrders: 3456,
      revenue: 125678.90,
      growth: 15.2
    }
  })

  fastify.post('/users', {
    schema: {
      description: 'Create a new user',
      tags: ['users'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['name', 'email']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: userSchema
          }
        }
      }
    }
  }, async function (request, reply) {
    const newUser = request.body as Partial<User>
    
    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: Math.floor(Math.random() * 1000) + 100,
        ...newUser
      }
    }
  })

  fastify.post('/products', {
    schema: {
      description: 'Create a new product',
      tags: ['products'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' }
        },
        required: ['name', 'price', 'category']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            product: productSchema
          }
        }
      }
    }
  }, async function (request, reply) {
    const newProduct = request.body as Partial<Product>
    
    return {
      success: true,
      message: 'Product created successfully',
      product: {
        id: Math.floor(Math.random() * 1000) + 100,
        ...newProduct
      }
    }
  })

  fastify.post('/feedback', {
    schema: {
      description: 'Submit feedback',
      tags: ['feedback'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          message: { type: 'string' }
        },
        required: ['name', 'email', 'message']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            id: { type: 'number' },
            submittedAt: { type: 'string' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const feedback = request.body as { name: string, email: string, message: string }
    
    // Process feedback (in real implementation, would save to database)
    fastify.log.info({ feedback }, 'Feedback received')
    
    return {
      success: true,
      message: 'Feedback submitted successfully',
      id: Math.floor(Math.random() * 10000) + 1000,
      submittedAt: new Date().toISOString()
    }
  })

  // Error testing endpoint - reproduces the exception from the stack trace
  // Analysis based on logs: This endpoint was accessed via browser from /docs swagger interface
  // Original context: Memory usage was normal (33MB RSS), running in development mode
  fastify.get('/error', {
    schema: {
      description: 'Test error endpoint for exception handling integration testing',
      tags: ['testing'],
      querystring: {
        type: 'object',
        properties: {
          type: { 
            type: 'string', 
            enum: ['sync', 'async', 'validation'],
            description: 'Type of error to simulate'
          },
          delay: { 
            type: 'number', 
            minimum: 0, 
            maximum: 5000,
            description: 'Delay in ms before throwing error'
          }
        }
      },
      response: {
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async function (request, reply) {
    const query = request.query as { type?: string; delay?: number }
    
    // Enhanced logging with runtime monitoring context
    fastify.log.info({
      endpoint: '/error',
      method: request.method,
      url: request.url,
      query: query,
      userAgent: request.headers['user-agent'],
      referrer: request.headers.referer,
      runtime: {
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        pid: process.pid
      },
      message: 'Test error endpoint accessed - simulating exception handling'
    })

    // Add optional delay for testing async error scenarios
    if (query.delay && query.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, query.delay))
    }

    // Simulate different types of errors based on query parameter
    switch (query.type) {
      case 'async':
        setTimeout(() => {
          throw new Error('Async error test - this should be caught by process error handlers')  
        }, 10)
        return { message: 'Async error scheduled' }
        
      case 'validation':
        const invalidData: any = { invalidField: 'test' }
        return invalidData.nonExistentMethod()
        
      case 'sync':
      default:
        // This reproduces the original error from the stack trace
        // Timeline context from logs: User was browsing /docs, clicked on /error endpoint
        // System was stable with normal memory usage before the exception
        throw new Error('This is a test error to check exception catcher integration')
    }
  })
}

export default demo