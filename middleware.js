// Middleware is intentionally minimal.
// Auth checks are handled client-side by each page.
// This avoids conflicts with Supabase's implicit OAuth flow
// which stores sessions in localStorage (invisible to server middleware).

import { NextResponse } from 'next/server';

export function middleware() {
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
