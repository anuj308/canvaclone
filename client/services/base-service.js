import { getSession, signOut } from 'next-auth/react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:5000'
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);
const MAX_RETRIES = 2;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(error, attempt) {
    const retryAfterHeader = error?.response?.headers?.['retry-after'];
    const retryAfterSeconds = Number(retryAfterHeader);

    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
        return retryAfterSeconds * 1000;
    }

    return 1000 * attempt;
}

export async function fetchWithAuth(endpoint,options={}){
    let session = null;

    try {
        session = await getSession();
    } catch (error) {
        console.error('Failed to resolve session:', error);
    }

    if(!session?.idToken){
        await signOut({ callbackUrl: '/login' });
        return {
            success: false,
            message: 'Not authenticated',
            status: 401
        };
    }

    if (session?.error === 'RefreshAccessTokenError') {
        await signOut({ callbackUrl: '/login' });
        throw new Error('Session expired. Please login again.');
    }

    if (session?.error === 'MissingRefreshToken') {
        await signOut({ callbackUrl: '/login?consent=1' });
        throw new Error('Session requires Google consent to continue.');
    }

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            const response = await axios({
                url : `${API_URL}${endpoint}`,
                method : options.method || 'GET',
                headers: {
                    Authorization : `Bearer ${session.idToken}`,
                    ...options.headers
                },
                data : options.body,
                params : options.params,
                timeout: 90000,
            })

            return response.data;
        } catch (error) {
            const statusCode = error?.response?.status;
            const shouldRetry = RETRYABLE_STATUS_CODES.has(statusCode) && attempt <= MAX_RETRIES;

            if (statusCode === 401) {
                await signOut({ callbackUrl: '/login' });
            }

            if (shouldRetry) {
                await sleep(getRetryDelay(error, attempt));
                continue;
            }

            throw new Error(error?.response?.data?.message || error?.message || 'Api request failed')
        }
    }
}