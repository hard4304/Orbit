import { Types } from "mongoose";

// ==================== User ====================
export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  telegramChatId?: string;
  telegramLinked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

// ==================== Habit ====================
export interface IHabit {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "custom";
  customDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  reminderTime?: string; // HH:mm format
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHabitLog {
  _id: Types.ObjectId;
  habitId: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
  createdAt: Date;
}

export interface CreateHabitDTO {
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "custom";
  customDays?: number[];
  reminderTime?: string;
  color?: string;
}

export interface HabitLogDTO {
  date: string;
  completed: boolean;
  note?: string;
}

// ==================== Gym ====================
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core"
  | "cardio"
  | "full_body";

export interface IExerciseSet {
  setNumber: number;
  weight: number; // in kg
  reps: number;
  restTime?: number; // in seconds
  notes?: string;
}

export interface IExercise {
  name: string;
  muscleGroup: MuscleGroup;
  sets: IExerciseSet[];
}

export interface IWorkout {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  name: string; // e.g., "Push Day", "Leg Day"
  exercises: IExercise[];
  duration?: number; // total minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGymSession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  exercises: IExercise[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutDTO {
  date: string;
  name: string;
  exercises: IExercise[];
  duration?: number;
  notes?: string;
}

export interface StartGymSessionDTO {
  exercises?: IExercise[];
}

export interface AddExerciseToSessionDTO {
  name: string;
  muscleGroup: MuscleGroup;
}

export interface AddSetToExerciseDTO {
  exerciseIndex: number;
  weight: number;
  reps: number;
  restTime?: number;
  notes?: string;
}

// ==================== Personal Finance ====================
export type ExpenseCategory =
  | "food"
  | "transport"
  | "rent"
  | "entertainment"
  | "shopping"
  | "health"
  | "utilities"
  | "other";

export type PaymentMedium = "upi" | "card" | "cash";

export interface IExpense {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  category: ExpenseCategory;
  medium: PaymentMedium;
  date: string; // YYYY-MM-DD
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDTO {
  amount: number;
  category: ExpenseCategory;
  medium: PaymentMedium;
  date: string;
  description: string;
}

// ==================== Food Tracker ====================
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface IFoodLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  quantity: number;
  servingSize: number; // grams per serving
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFoodLogDTO {
  date: string;
  mealType: MealType;
  foodName: string;
  quantity: number;
  servingSize: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// ==================== Learning Tracker ====================
export type LearningCategory = "dsa" | "lld" | "hld" | "frontend" | "backend" | "devops" | "general" | "work";

export interface ILearning {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  category: LearningCategory;
  title: string;
  content: string; // notes / what you learned
  tags?: string[];
  durationMinutes?: number; // how long you studied
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLearningDTO {
  date: string;
  category: LearningCategory;
  title: string;
  content: string;
  tags?: string[];
  durationMinutes?: number;
}

// ==================== Body Care ====================
export type BodyCareType = "skincare" | "haircare" | "bodycare" | "other";

export interface IBodyCareLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  type: BodyCareType;
  title: string;
  notes?: string;
  products?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBodyCareLogDTO {
  date: string;
  type: BodyCareType;
  title: string;
  notes?: string;
  products?: string[];
}

// ==================== Reports ====================
export type ReportType = "bug" | "feature";
export type ReportStatus = "open" | "in-progress" | "done";

export interface IReport {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: ReportType;
  title: string;
  description: string;
  screenshotUrl?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportDTO {
  type: ReportType;
  title: string;
  description: string;
  screenshotUrl?: string;
}

// ==================== API Response ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
