import { Router } from 'express';

const router = Router();

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'GökAkademi API',
    version: '1.0.0',
    description: 'Authentication and CRUD endpoints documentation',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: { type: 'object' },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/admin/login': {
      post: { summary: 'Admin login', responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
    },
    '/auth/logout': {
      post: { summary: 'Logout', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/courses': {
      get: { summary: 'List courses', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
    },
  },
};

router.get('/', (req, res) => {
  res.json(swaggerSpec);
});

export default router;