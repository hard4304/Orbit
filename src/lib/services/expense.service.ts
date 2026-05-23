import { expenseRepository } from "@/lib/repositories/expense.repository";
import { createExpenseSchema } from "@/lib/validators/expense.validator";
import { CreateExpenseDTO, IExpense } from "@/types";

export class ExpenseService {
  async createExpense(userId: string, data: CreateExpenseDTO): Promise<IExpense> {
    const parsed = createExpenseSchema.parse(data);
    return expenseRepository.createExpense(userId, parsed);
  }

  async getExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<IExpense[]> {
    return expenseRepository.getExpensesByDateRange(userId, startDate, endDate);
  }

  async getExpensesByCategory(
    userId: string,
    startDate: string,
    endDate: string,
    category: string
  ): Promise<IExpense[]> {
    return expenseRepository.getExpensesByCategory(userId, startDate, endDate, category);
  }

  async updateExpense(userId: string, expenseId: string, data: Partial<CreateExpenseDTO>): Promise<IExpense | null> {
    return expenseRepository.updateExpense(userId, expenseId, data);
  }

  async deleteExpense(userId: string, expenseId: string): Promise<boolean> {
    return expenseRepository.deleteExpense(userId, expenseId);
  }
}

export const expenseService = new ExpenseService();
