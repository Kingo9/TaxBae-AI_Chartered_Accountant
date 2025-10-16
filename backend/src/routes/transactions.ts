import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { CustomError } from '../middleware/error-handler';

const router = Router();

// Get all transactions for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', type, category, startDate, endDate } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = { userId: req.user!.id };
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = { contains: category as string, mode: 'insensitive' };
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          subCategory: true,
          description: true,
          date: true,
          location: true,
          isRecurring: true,
          isTaxDeductible: true,
          taxSection: true,
          receiptUrl: true,
          createdAt: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new transaction
router.post('/',
  authenticate,
  [
    body('type').isIn(['INCOME', 'EXPENSE', 'INVESTMENT', 'TRANSFER']),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('subCategory').optional().trim(),
    body('location').optional().trim(),
    body('isRecurring').optional().isBoolean(),
    body('isTaxDeductible').optional().isBoolean(),
    body('taxSection').optional().trim(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const transactionData = {
        ...req.body,
        userId: req.user!.id,
        date: new Date(req.body.date),
      };

      const transaction = await prisma.transaction.create({
        data: transactionData,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          subCategory: true,
          description: true,
          date: true,
          location: true,
          isRecurring: true,
          isTaxDeductible: true,
          taxSection: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update transaction
router.put('/:id',
  authenticate,
  [
    body('amount').optional().isFloat({ min: 0.01 }),
    body('category').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('date').optional().isISO8601(),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (updateData.date) {
        updateData.date = new Date(updateData.date);
      }

      // Verify transaction belongs to user
      const existingTransaction = await prisma.transaction.findFirst({
        where: { id, userId: req.user!.id },
      });

      if (!existingTransaction) {
        const error = new Error('Transaction not found') as CustomError;
        error.statusCode = 404;
        return next(error);
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          subCategory: true,
          description: true,
          date: true,
          location: true,
          isRecurring: true,
          isTaxDeductible: true,
          taxSection: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Transaction updated successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify transaction belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existingTransaction) {
      const error = new Error('Transaction not found') as CustomError;
      error.statusCode = 404;
      return next(error);
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction analytics
router.get('/analytics', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear().toString() } = req.query;
    const userId = req.user!.id;

    // Monthly breakdown
    const monthlyData = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE "userId" = ${userId} 
        AND EXTRACT(YEAR FROM date) = ${parseInt(year)}
      GROUP BY EXTRACT(MONTH FROM date), type
      ORDER BY month
    `;

    // Category breakdown
    const categoryData = await prisma.transaction.groupBy({
      by: ['category', 'type'],
      where: { 
        userId,
        date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Tax deduction eligible transactions
    const taxDeductibleTransactions = await prisma.transaction.groupBy({
      by: ['taxSection'],
      where: {
        userId,
        isTaxDeductible: true,
        date: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
      _sum: { amount: true },
    });

    res.json({
      message: 'Transaction analytics retrieved successfully',
      data: {
        monthlyData,
        categoryData,
        taxDeductibleTransactions,
        year: parseInt(year),
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as transactionRoutes };
