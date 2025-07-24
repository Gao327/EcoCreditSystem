import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../../shared/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date()
    }
  }
});

app.use(limiter);

// Add request ID middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = uuidv4();
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
});

// Service endpoints configuration
const services = {
  stepTracker: process.env.STEP_TRACKER_URL || 'http://localhost:3001',
  creditSystem: process.env.CREDIT_SYSTEM_URL || 'http://localhost:3002',
  payment: process.env.PAYMENT_URL || 'http://localhost:3003',
  user: process.env.USER_SERVICE_URL || 'http://localhost:3004'
};

// Health check endpoint
app.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      services: Object.keys(services),
      version: '1.0.0'
    }
  };
  res.json(response);
});

// Service status endpoint
app.get('/status', async (req, res) => {
  const serviceStatus: Record<string, boolean> = {};
  
  // Check each service health (simplified for MVP)
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      // In a real implementation, you would make HTTP calls to check service health
      serviceStatus[serviceName] = true;
    } catch (error) {
      serviceStatus[serviceName] = false;
    }
  }

  const response: ApiResponse = {
    success: true,
    data: {
      gateway: 'healthy',
      services: serviceStatus,
      timestamp: new Date()
    }
  };
  
  res.json(response);
});

// Authentication routes - proxy to user service
app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth'
  },
  onError: (err, req, res) => {
    console.error('User service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'User service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// User management routes
app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  },
  onError: (err, req, res) => {
    console.error('User service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'User service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// Step tracking routes - proxy to step tracker service
app.use('/api/steps', createProxyMiddleware({
  target: services.stepTracker,
  changeOrigin: true,
  pathRewrite: {
    '^/api/steps': '/steps'
  },
  onError: (err, req, res) => {
    console.error('Step tracker service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Step tracking service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// Credit system routes - proxy to credit service
app.use('/api/credits', createProxyMiddleware({
  target: services.creditSystem,
  changeOrigin: true,
  pathRewrite: {
    '^/api/credits': '/credits'
  },
  onError: (err, req, res) => {
    console.error('Credit system service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Credit system service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// Payment/Rewards routes - proxy to payment service
app.use('/api/rewards', createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: {
    '^/api/rewards': '/rewards'
  },
  onError: (err, req, res) => {
    console.error('Payment service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Payment service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// Achievement routes
app.use('/api/achievements', createProxyMiddleware({
  target: services.creditSystem,
  changeOrigin: true,
  pathRewrite: {
    '^/api/achievements': '/achievements'
  },
  onError: (err, req, res) => {
    console.error('Achievement service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Achievement service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// Challenge routes
app.use('/api/challenges', createProxyMiddleware({
  target: services.creditSystem,
  changeOrigin: true,
  pathRewrite: {
    '^/api/challenges': '/challenges'
  },
  onError: (err, req, res) => {
    console.error('Challenge service proxy error:', err);
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Challenge service is currently unavailable',
        timestamp: new Date()
      }
    };
    res.status(503).json(response);
  }
}));

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${req.originalUrl} not found`,
      timestamp: new Date()
    }
  };
  res.status(404).json(response);
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Gateway error:', err);
  
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      timestamp: new Date()
    }
  };
  
  res.status(500).json(response);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Service status: http://localhost:${PORT}/status`);
  console.log('🔗 Configured services:', Object.keys(services));
});

export default app; 