import { Expense } from "../models/expense.model";
import { CreateExpenseDTO, IExpense } from "@/types";

export class ExpenseRepository {
  async createExpense(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    return Expense.create({
      userId,
      ...data,
    });
  }

  async getExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IExpense[]> {
    return Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });
  }

  async getExpensesByCategory(
    userId: string,
    startDate: string,
    endDate: string,
    category: string
  ): Promise<IExpense[]> {
    return Expense.find({
      userId,
      category,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1, createdAt: -1 });
  }

  async updateExpense(userId: string, expenseId: string, data: Partial<CreateExpenseDTO>): Promise<IExpense | null> {
    return Expense.findOneAndUpdate(
      { _id: expenseId, userId },
      { $set: data },
      { new: true }
    );
  }

  async deleteExpense(userId: string, expenseId: string): Promise<boolean> {
    const result = await Expense.deleteOne({ _id: expenseId, userId });
    return result.deletedCount > 0;
  }
}

export const expenseRepository = new ExpenseRepository();
