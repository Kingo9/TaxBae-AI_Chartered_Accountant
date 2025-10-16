import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { CustomError } from '../middleware/error-handler';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        userType: true,
        profilePicture: true,
        annualIncome: true,
        taxRegime: true,
        panNumber: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      const error = new Error('User not found') as CustomError;
      error.statusCode = 404;
      return next(error);
    }

    res.json({
      message: 'Profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', 
  authenticate, 
  [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('phone').optional().isMobilePhone('en-IN'),
    body('annualIncome').optional().isFloat({ min: 0 }),
    body('taxRegime').optional().isIn(['OLD_REGIME', 'NEW_REGIME']),
    body('panNumber').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { name, phone, annualIncome, taxRegime, panNumber } = req.body;
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (annualIncome !== undefined) updateData.annualIncome = annualIncome;
      if (taxRegime !== undefined) updateData.taxRegime = taxRegime;
      if (panNumber !== undefined) updateData.panNumber = panNumber;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          userType: true,
          profilePicture: true,
          annualIncome: true,
          taxRegime: true,
          panNumber: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put('/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  async (req: AuthRequest, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(errors.array());
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { password: true },
      });

      if (!user) {
        const error = new Error('User not found') as CustomError;
        error.statusCode = 404;
        return next(error);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        const error = new Error('Current password is incorrect') as CustomError;
        error.statusCode = 400;
        return next(error);
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedNewPassword },
      });

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user dashboard data
router.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get aggregated data
    const [
      transactionStats,
      investmentStats,
      recentTransactions,
      upcomingReminders,
      unreadNotifications,
    ] = await Promise.all([
      // Transaction statistics
      prisma.transaction.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { amount: true },
        _count: { id: true },
      }),
      
      // Investment statistics
      prisma.investment.aggregate({
        where: { userId },
        _sum: {
          amount: true,
          currentValue: true,
        },
        _count: { id: true },
      }),
      
      // Recent transactions
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          amount: true,
          category: true,
          description: true,
          date: true,
        },
      }),
      
      // Upcoming reminders
      prisma.reminder.findMany({
        where: {
          userId,
          isCompleted: false,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      
      // Unread notifications count
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    // Calculate financial summary
    const totalIncome = transactionStats
      .filter(stat => stat.type === 'INCOME')
      .reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    
    const totalExpenses = transactionStats
      .filter(stat => stat.type === 'EXPENSE')
      .reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);

    const totalInvestments = investmentStats._sum.amount || 0;
    const currentInvestmentValue = investmentStats._sum.currentValue || 0;
    const investmentGainLoss = currentInvestmentValue - totalInvestments;

    res.json({
      message: 'Dashboard data retrieved successfully',
      data: {
        financialSummary: {
          totalIncome,
          totalExpenses,
          netSavings: totalIncome - totalExpenses,
          totalInvestments,
          currentInvestmentValue,
          investmentGainLoss,
          investmentReturnPercentage: totalInvestments > 0 
            ? ((investmentGainLoss / totalInvestments) * 100) 
            : 0,
        },
        recentTransactions,
        upcomingReminders,
        unreadNotifications,
        investmentCount: investmentStats._count,
        transactionStats: transactionStats.map(stat => ({
          type: stat.type,
          total: stat._sum.amount || 0,
          count: stat._count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/account', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      const error = new Error('Password is required to delete account') as CustomError;
      error.statusCode = 400;
      return next(error);
    }

    // Verify password before deletion
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true },
    });

    if (!user) {
      const error = new Error('User not found') as CustomError;
      error.statusCode = 404;
      return next(error);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid password') as CustomError;
      error.statusCode = 400;
      return next(error);
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: req.user!.id },
    });

    res.json({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
