// src/services/api.js - Updated to use direct Supabase for data operations
import { supabase } from './supabaseAuth'; // <-- Use the instance from supabaseAuth.js
import SupabaseAuthService from './supabaseAuth';

class ApiService {
  constructor() {
    this.supabase = supabase;
    this.auth = SupabaseAuthService;
  }

  // ============================================================================
  // AUTH OPERATIONS - Use existing implementations
  // ============================================================================

  async loginWithGoogle() {
    return await this.auth.signInWithGoogle();
  }

  async logout() {
    return await this.auth.signOut();
  }

  async refreshToken() {
    return await this.auth.refreshSession();
  }

  async getCurrentSession() {
    return await this.auth.getCurrentSession();
  }

  async getUserProfile() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;

      if (!user) {
        throw new Error('No authenticated user');
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          currency: user.user_metadata?.currency || 'USD',
          language: user.user_metadata?.language || 'en',
          created_at: user.created_at,
          email_verified: !!user.email_confirmed_at,
          avatar_url: user.user_metadata?.avatar_url
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // TRANSACTION OPERATIONS - Direct Database Queries
  // ============================================================================

  async createTransaction(transactionData) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Auto-categorize if not provided
      const category = transactionData.category || this.categorizeTransaction(
        transactionData.description, 
        transactionData.transaction_type
      );

      const { data, error } = await this.supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          amount: parseFloat(transactionData.amount),
          description: transactionData.description,
          category: category,
          transaction_type: transactionData.transaction_type,
          original_message: `${transactionData.description} ${transactionData.amount}`,
          source_platform: 'mobile_app',
          merchant: transactionData.merchant,
          date: transactionData.date || new Date().toISOString(),
          location: transactionData.location,
          tags: transactionData.tags || []
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `${transactionData.transaction_type === 'expense' ? 'Expense' : 'Income'} recorded successfully`,
        transaction: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTransactions(days = 30, transactionType = null) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      let query = this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', cutoffDate.toISOString())
        .order('date', { ascending: false });

      if (transactionType) {
        query = query.eq('transaction_type', transactionType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        transactions: data || [],
        count: data?.length || 0,
        period_days: days,
        transaction_type: transactionType || "all"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTransactionSummary(days = 30) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', cutoffDate.toISOString());

      if (error) throw error;

      // Calculate summary from raw data
      const expenses = data.filter(t => t.transaction_type === 'expense');
      const income = data.filter(t => t.transaction_type === 'income');

      const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalIncome = income.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const netIncome = totalIncome - totalExpenses;

      // Category breakdown
      const expenseCategories = this.groupByCategory(expenses);
      const incomeCategories = this.groupByCategory(income);

      return {
        success: true,
        summary: {
          total_expenses: totalExpenses,
          total_income: totalIncome,
          net_income: netIncome,
          expense_count: expenses.length,
          income_count: income.length,
          average_expense: expenses.length ? totalExpenses / expenses.length : 0,
          average_income: income.length ? totalIncome / income.length : 0,
          expense_categories: expenseCategories,
          income_categories: incomeCategories,
          period_days: days,
          is_profitable: netIncome > 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // REMINDER OPERATIONS - Direct Database Queries
  // ============================================================================

  async createReminder(reminderData) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('reminders')
        .insert([{
          user_id: user.id,
          title: reminderData.title,
          description: reminderData.description,
          source_platform: 'mobile_app',
          due_datetime: reminderData.due_datetime,
          reminder_type: reminderData.reminder_type || 'general',
          priority: reminderData.priority || 'medium',
          is_recurring: reminderData.is_recurring || false,
          recurrence_pattern: reminderData.recurrence_pattern,
          tags: reminderData.tags
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: 'Reminder created successfully',
        reminder: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReminders(includeCompleted = false, limit = 50) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = this.supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_datetime', { ascending: true, nullsLast: true })
        .order('priority', { ascending: false })
        .limit(limit);

      if (!includeCompleted) {
        query = query.eq('is_completed', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      return {
        success: true,
        reminders: data || [],
        count: data?.length || 0,
        include_completed: includeCompleted
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getDueReminders(hoursAhead = 24) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() + hoursAhead);

      const { data, error } = await this.supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .not('due_datetime', 'is', null)
        .lte('due_datetime', cutoffTime.toISOString())
        .order('due_datetime', { ascending: true });

      if (error) throw error;

      return {
        success: true,
        reminders: data || [],
        count: data?.length || 0,
        hours_ahead: hoursAhead
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async completeReminder(reminderId) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('reminders')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Reminder not found or already completed');
      }

      return {
        success: true,
        message: 'Reminder marked as completed',
        reminder_id: reminderId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReminderSummary(days = 30) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', cutoffDate.toISOString());

      if (error) throw error;

      // Calculate summary from raw data
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const totalCount = data.length;
      const completedCount = data.filter(r => r.is_completed).length;
      const pendingCount = totalCount - completedCount;
      const overdueCount = data.filter(r => 
        !r.is_completed && r.due_datetime && new Date(r.due_datetime) < now
      ).length;
      const dueTodayCount = data.filter(r => 
        !r.is_completed && r.due_datetime && 
        new Date(r.due_datetime) >= today && new Date(r.due_datetime) < tomorrow
      ).length;

      // Priority and type breakdown
      const byPriority = this.groupByField(data.filter(r => !r.is_completed), 'priority');
      const byType = this.groupByField(data.filter(r => !r.is_completed), 'reminder_type');

      return {
        success: true,
        summary: {
          total_count: totalCount,
          completed_count: completedCount,
          pending_count: pendingCount,
          overdue_count: overdueCount,
          due_today_count: dueTodayCount,
          completion_rate: totalCount ? (completedCount / totalCount) * 100 : 0,
          has_urgent_items: byPriority.urgent > 0,
          by_priority: byPriority,
          by_type: byType,
          period_days: days
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // UTILITY OPERATIONS
  // ============================================================================

  async getActivitySummary(days = 30) {
    try {
      // Get both transaction and reminder summaries
      const [transactionResult, reminderResult] = await Promise.all([
        this.getTransactionSummary(days),
        this.getReminderSummary(days)
      ]);

      if (!transactionResult.success || !reminderResult.success) {
        throw new Error('Failed to get activity data');
      }

      return {
        success: true,
        activity: {
          transaction_summary: transactionResult.summary,
          reminder_summary: reminderResult.summary,
          period_days: days
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCategories() {
    // Use the same categories as categorizeTransaction
    const categories = {
      expense: [
        "Essentials",
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Utilities",
        "Healthcare",
        "Travel",
        "Education",
        "Other"
      ],
      income: [
        "Salary",
        "Freelance",
        "Business",
        "Investment",
        "Gift",
        "Refund",
        "Rental",
        "Other"
      ]
    };
    return {
      success: true,
      categories
    };
  }

  async getHealthCheck() {
    try {
      // Simple health check by trying to get current user
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      return {
        status: error ? "unhealthy" : "healthy",
        service: "Okan Personal Assistant - Direct Supabase",
        version: "2.0.0",
        database: "connected",
        authenticated: !!user,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  categorizeTransaction(description, transactionType) {
    if (!description) return "Other";

    const descLower = description.toLowerCase();

    const categories = {
      expense: {
        "Essentials": [
          "rent", "mortgage", "utility", "electric", "water", "gas", "fuel", "groceries", "grocery", "food", "insurance", "phone", "internet", "healthcare", "doctor", "pharmacy", "medicine", "medical", "dentist"
        ],
        "Food & Dining": ["restaurant", "coffee", "lunch", "dinner", "takeout", "starbucks", "mcdonalds"],
        "Transportation": ["uber", "taxi", "parking", "bus", "train", "flight", "lyft"],
        "Shopping": ["amazon", "store", "clothes", "electronics", "book", "shopping", "mall"],
        "Entertainment": ["movie", "game", "concert", "netflix", "spotify", "streaming", "music"],
        "Utilities": ["utility"], // Keep for legacy, but most are now in Essentials
        "Healthcare": ["doctor", "hospital", "pharmacy", "medicine", "dentist", "medical"], // Also in Essentials
        "Travel": ["hotel", "airbnb", "vacation", "trip", "booking", "travel"],
        "Education": ["school", "course", "tuition", "book", "education", "training"]
      },
      income: {
        "Salary": ["salary", "paycheck", "wage", "income", "pay"],
        "Freelance": ["freelance", "contract", "consulting", "gig"],
        "Business": ["business", "revenue", "sales", "profit"],
        "Investment": ["dividend", "interest", "stock", "crypto", "investment"],
        "Gift": ["gift", "bonus", "present", "reward"],
        "Refund": ["refund", "return", "reimbursement", "cashback"],
        "Rental": ["rent", "rental", "lease", "property"]
      }
    };

    const typeCategories = categories[transactionType] || {};

    for (const [category, keywords] of Object.entries(typeCategories)) {
      if (keywords.some(keyword => descLower.includes(keyword))) {
        return category;
      }
    }

    return "Other";
  }

  groupByCategory(transactions) {
    const grouped = {};
    transactions.forEach(t => {
      const category = t.category;
      if (!grouped[category]) {
        grouped[category] = { category, count: 0, total: 0 };
      }
      grouped[category].count++;
      grouped[category].total += parseFloat(t.amount);
    });
    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }

  groupByField(items, field) {
    const grouped = {};
    items.forEach(item => {
      const value = item[field] || 'unknown';
      grouped[value] = (grouped[value] || 0) + 1;
    });
    return grouped;
  }

  async updateTransaction(transactionId, updateData) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('transactions')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, transaction: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteTransaction(transactionId) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateReminder(reminderId, updateData) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('reminders')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, reminder: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteReminder(reminderId) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserSettings() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return { success: true, settings: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserSettings(settings) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await this.supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return { success: true, settings: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new ApiService();