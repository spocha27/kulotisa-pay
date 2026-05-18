import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth';
import onboardingRoutes from './routes/onboarding';
import eligibilityRoutes from './routes/eligibility';
import transactionRoutes from './routes/transactions';
import merchantRoutes from './routes/merchants';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'kulotisa-backend', ts: new Date() }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 KulotisaPay backend running on port ${PORT}`));
export default app;
