import { api } from '../config/api';

export interface UserFeedback {
  id: string;
  user_id?: number | null;
  user_name?: string | null;
  user_email?: string | null;
  category: 'feature_request' | 'bug_report' | 'translation_correction' | 'improvement' | 'compliment';
  subject: string;
  message: string;
  status: 'new' | 'under_review' | 'planned' | 'resolved';
  admin_notes?: string | null;
  created_at: string;
}

export interface CreateFeedbackPayload {
  category: 'feature_request' | 'bug_report' | 'translation_correction' | 'improvement' | 'compliment';
  subject: string;
  message: string;
  user_name?: string;
  user_email?: string;
}

const LOCAL_FEEDBACK_KEY = '619_local_feedbacks';

export const feedbackService = {
  async submitFeedback(payload: CreateFeedbackPayload): Promise<UserFeedback> {
    try {
      const res = await api.post('/feedback', payload);
      if (res.data) {
        this.saveToLocalStorage(res.data);
        return res.data;
      }
    } catch (e) {
      console.warn('Backend unavailable, saving feedback locally', e);
    }

    // Local Fallback
    const localItem: UserFeedback = {
      id: crypto.randomUUID(),
      user_name: payload.user_name || 'Anonymous User',
      user_email: payload.user_email || 'anonymous@ummah.app',
      category: payload.category,
      subject: payload.subject,
      message: payload.message,
      status: 'new',
      created_at: new Date().toISOString()
    };

    this.saveToLocalStorage(localItem);
    return localItem;
  },

  async getFeedbacks(status?: string, category?: string): Promise<UserFeedback[]> {
    try {
      const params: any = {};
      if (status && status !== 'all') params.status = status;
      if (category && category !== 'all') params.category = category;

      const res = await api.get('/admin/feedbacks', { params });
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn('Could not fetch online feedbacks, using local store', e);
    }

    // Fallback to local storage
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    let list: UserFeedback[] = raw ? JSON.parse(raw) : [];
    
    if (status && status !== 'all') {
      list = list.filter(item => item.status === status);
    }
    if (category && category !== 'all') {
      list = list.filter(item => item.category === category);
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateFeedbackStatus(id: string, newStatus: 'new' | 'under_review' | 'planned' | 'resolved', notes?: string): Promise<void> {
    try {
      await api.patch(`/admin/feedbacks/${id}/status`, {
        status: newStatus,
        admin_notes: notes
      });
    } catch (e) {
      console.warn('Failed to update status on server, updating locally', e);
    }

    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (raw) {
      const list: UserFeedback[] = JSON.parse(raw);
      const updated = list.map(item => item.id === id ? { ...item, status: newStatus, admin_notes: notes || item.admin_notes } : item);
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(updated));
    }
  },

  async deleteFeedback(id: string): Promise<void> {
    try {
      await api.delete(`/admin/feedbacks/${id}`);
    } catch (e) {
      console.warn('Failed to delete on server, deleting locally', e);
    }

    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    if (raw) {
      const list: UserFeedback[] = JSON.parse(raw);
      const filtered = list.filter(item => item.id !== id);
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(filtered));
    }
  },

  saveToLocalStorage(item: UserFeedback) {
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      const list: UserFeedback[] = raw ? JSON.parse(raw) : [];
      const exists = list.some(x => x.id === item.id);
      if (!exists) {
        list.unshift(item);
        localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(list));
      }
    } catch (e) {}
  }
};
