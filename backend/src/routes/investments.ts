import { Router } from 'express';
export const router = Router();
// Basic investment routes - will be expanded
router.get('/', (req, res) => res.json({ message: 'Investments endpoint' }));
export { router as investmentRoutes };
