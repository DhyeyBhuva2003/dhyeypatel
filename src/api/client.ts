import axios, { AxiosError, AxiosResponse } from "axios";

// Create custom Axios instance
export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookie-based JWT sessions
});

// Unified error response interface
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Request interceptor for custom logging/debugging
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error extraction
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const errorResponse: ApiErrorResponse = {
      success: false,
      message: "An unexpected network communication error occurred.",
    };

    if (error.response) {
      // Server returned a status code outside the 2xx range
      errorResponse.message = error.response.data?.message || `Request failed with status ${error.response.status}`;
      errorResponse.errors = error.response.data?.errors;
    } else if (error.request) {
      // Request was made but no response was received
      errorResponse.message = "No response received from the server. Check your connection.";
    } else {
      // Something else triggered the error
      errorResponse.message = error.message;
    }

    return Promise.reject(errorResponse);
  }
);

export default apiClient;
