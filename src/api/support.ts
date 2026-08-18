import { apiClient } from './client';
import { CallRequestPayload, CallRequestResponse, ApiResponse } from '../types/api';

export const supportApi = {
  /**
   * Submit human escalation request (e.g. parent requesting call with teacher or management).
   * Result is only shown as success after receiving real 200/201 response.
   */
  async requestTeacherCall(payload: CallRequestPayload): Promise<CallRequestResponse> {
    const res = await apiClient.post<ApiResponse<CallRequestResponse> | CallRequestResponse>(
      '/api/support/call-request',
      payload
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as CallRequestResponse;
  },

  /**
   * Check status of a submitted call request.
   */
  async getCallRequestStatus(requestId: string): Promise<CallRequestResponse> {
    const res = await apiClient.get<ApiResponse<CallRequestResponse> | CallRequestResponse>(
      `/api/support/call-request/${requestId}`
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as CallRequestResponse;
  }
};
