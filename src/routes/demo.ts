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
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          age: { type: 'number', minimum: 0, maximum: 150 }
        },
        required: ['name', 'email'],
        additionalProperties: false
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: userSchema
          }
        },
        400: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    preValidation: async (request, reply) => {
      request.log.info({
        method: request.method,
        url: request.url,
        body: request.body,
        headers: request.headers,
        timestamp: new Date().toISOString()
      }, 'POST /users request received')
    },
    errorHandler: async (error, request, reply) => {
      if (error.validation) {
        request.log.warn({
          error: error.message,
          validationErrors: error.validation,
          body: request.body,
          timestamp: new Date().toISOString(),
          context: 'Request body contained incorrect field names or missing required fields'
        }, 'Validation error on POST /users - likely field name mismatch (e.g., "emails" instead of "email")')
        
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: `Validation failed: ${error.message}. Check field names: required fields are 'name' and 'email'.`
        })
      }
      throw error
    }
  }, async function (request, reply) {
    const newUser = request.body as Partial<User>
    
    request.log.info({
      userId: Math.floor(Math.random() * 1000) + 100,
      userData: newUser,
      timestamp: new Date().toISOString()
    }, 'User created successfully')
    
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
    
    return {
      success: true,
      message: 'Feedback submitted successfully',
      id: Math.floor(Math.random() * 10000) + 1000,
      submittedAt: new Date().toISOString()
    }
  })
}

export default demo