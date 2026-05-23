import { NextResponse } from "next/server";
import { expenseService } from "@/lib/services/expense.service";
import { requireAuth } from "@/lib/middleware/auth";
import { handleApiError } from "@/lib/middleware/error-handler";
import { ApiResponse } from "@/types";

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const expenses = await expenseService.getExpensesByDateRange(user.id, startDate, endDate);
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const expense = await expenseService.createExpense(user.id, body);
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
