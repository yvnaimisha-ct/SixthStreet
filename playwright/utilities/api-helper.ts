import { APIRequestContext, APIResponse, test } from '@playwright/test';
import * as allure from "allure-js-commons";
import { apiConfig } from '../playwright.config';

/**
 * API Helper class for Playwright API automation.
 * Provides reusable methods for making API requests (GET, POST, PUT, PATCH, DELETE).
 * Supports Allure reporting by logging request/response details.
 */
export class ApiHelper {
  private baseURL: string;
  private token: string | null;

  /**
   * Constructor for ApiHelper
   * @param {string | null} token - Optional authentication token for API requests
   */
  constructor(token: string | null = null) {
    this.baseURL = apiConfig.baseURL;
    this.token = token || apiConfig.authToken;
    this.token = null; // Overwrites token value (Consider removing this line if authentication is required)
  }

  /**
   * Generates request headers including optional authorization token.
   * @param {Record<string, string>} customHeaders - Additional headers to merge with default headers.
   * @returns {Record<string, string>} - The complete set of request headers.
   */
  private getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Logs API request and response details into Allure Report.
   * @param {string} requestType - HTTP method (GET, POST, etc.)
   * @param {string} url - Full API endpoint URL
   * @param {object | null} requestBody - Request payload (if applicable)
   * @param {APIResponse} response - Response object from Playwright API call
   * @param {number} startTime - Request start time (for calculating response time)
   */
  private async logRequestDetails(
    requestType: string,
    url: string,
    requestBody: object | null,
    response: APIResponse,
    startTime: number
  ) {
    const responseTime = Date.now() - startTime;
    const responseBody = await response.text();

    await test.step(`${requestType} Request to ${url}`, () => {
      allure.attachment('Request Body', JSON.stringify(requestBody, null, 2), 'application/json');
      if (responseBody)
       allure.attachment('Response Body', JSON.stringify(JSON.parse(responseBody), null, 2), 'application/json');
      allure.parameter('URL', url);
      allure.parameter('Status Code', response.status().toString());
      allure.parameter('Response Time', `${responseTime} ms`);
    });

    console.log(`✅ ${requestType} ${url} | Status: ${response.status()} | Time: ${responseTime}ms`);
  }

  /**
   * Sends a GET request to the specified API endpoint.
   * @param {APIRequestContext} request - Playwright request context
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @param {Record<string, string>} queryParams - Optional query parameters
   * @returns {Promise<APIResponse>} - API response object
   */
  async get(request: APIRequestContext, endpoint: string, queryParams: Record<string, string> = {}): Promise<APIResponse> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.entries(queryParams).forEach(([key, value]) => url.searchParams.append(key, value));

    const startTime = Date.now();
    const response = await request.get(url.toString(), { headers: this.getHeaders() });
    await this.logRequestDetails("GET", url.toString(), null, response, startTime);

    return response;
  }

  /**
   * Sends a POST request to the specified API endpoint.
   * @param {APIRequestContext} request - Playwright request context
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @param {object} data - Request payload
   * @returns {Promise<APIResponse>} - API response object
   */
  async post(request: APIRequestContext, endpoint: string, data: object): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    const response = await request.post(url, { headers: this.getHeaders(), data });
    await this.logRequestDetails("POST", url, data, response, startTime);
    return response;
  }

  /**
   * Sends a PUT request to the specified API endpoint.
   * @param {APIRequestContext} request - Playwright request context
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @param {object} data - Request payload
   * @returns {Promise<APIResponse>} - API response object
   */
  async put(request: APIRequestContext, endpoint: string, data: object): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    const response = await request.put(url, { headers: this.getHeaders(), data });

    await this.logRequestDetails("PUT", url, data, response, startTime);
    return response;
  }

  /**
   * Sends a PATCH request to the specified API endpoint.
   * @param {APIRequestContext} request - Playwright request context
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @param {object} data - Request payload
   * @returns {Promise<APIResponse>} - API response object
   */
  async patch(request: APIRequestContext, endpoint: string, data: object): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    const response = await request.patch(url, { headers: this.getHeaders(), data });

    await this.logRequestDetails("PATCH", url, data, response, startTime);
    return response;
  }

  /**
   * Sends a DELETE request to the specified API endpoint.
   * @param {APIRequestContext} request - Playwright request context
   * @param {string} endpoint - API endpoint (relative to base URL)
   * @returns {Promise<APIResponse>} - API response object
   */
  async delete(request: APIRequestContext, endpoint: string): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    const startTime = Date.now();
    const response = await request.delete(url, { headers: this.getHeaders() });

    await this.logRequestDetails("DELETE", url, null, response, startTime);
    return response;
  }
}