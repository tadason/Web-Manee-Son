import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock API: /api/describe-app
app.post('/api/describe-app', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  // Mock description - for testing only
  const mockDescription = {
    appName: url.split('/')[2].split('.').join(' ').toUpperCase() || 'Unknown App',
    oneLiner: `A powerful platform for ${url.split('/')[2]}`,
    valueProps: ['High Performance', 'User Friendly', 'Secure', 'Scalable'],
    targetUsers: ['Developers', 'Businesses', 'Individuals'],
    keyFeatures: [
      'Real-time Updates',
      'Advanced Analytics',
      'Easy Integration',
      ' 24/7 Support'
    ],
    whyNow: 'Modern problems require modern solutions. This platform provides cutting-edge technology.',
    howToUse: [
      'Sign up for an account',
      'Connect your data sources',
      'Configure your preferences',
      'Start analyzing immediately'
    ],
    risksOrNotes: [
      'Ensure proper data validation',
      'Keep credentials secure',
      'Monitor API usage limits'
    ],
  };

  res.json({ description: mockDescription });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`✅ Mock API server running on http://localhost:${PORT}`);
  console.log(`📝 POST /api/describe-app - Mock description endpoint`);
});
