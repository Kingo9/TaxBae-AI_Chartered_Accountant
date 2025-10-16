import { Router } from 'express';
export const router = Router();
// Basic market data routes - will be expanded with external API integration
router.get('/', (req, res) => res.json({ message: 'Market data endpoint' }));
export { router as marketDataRoutes };
