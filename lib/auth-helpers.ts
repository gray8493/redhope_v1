/**
 * Server-side auth helpers for API routes
 * Use these to verify authentication in all API endpoints
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

export interface AuthResult {
    user: AuthUser | null;
    error: NextResponse | null;
}

/**
 * Verify the current user from server-side cookies (API routes)
 * Returns the authenticated user with their DB role, or an error response
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) {
                            // Cookie setting may fail in some contexts
                        }
                    },
                },
            }
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                user: null,
                error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            };
        }

        // Fetch role from database (trusted source)
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();

        const role = profile?.role || 'donor';

        return {
            user: {
                id: user.id,
                email: user.email || '',
                role
            },
            error: null
        };
    } catch (error) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
        };
    }
}

/**
 * Require the user to be authenticated AND have a specific role
 */
export async function requireRole(allowedRoles: string[]): Promise<AuthResult> {
    const result = await getAuthenticatedUser();

    if (result.error || !result.user) {
        return result;
    }

    if (!allowedRoles.includes(result.user.role)) {
        return {
            user: null,
            error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        };
    }

    return result;
}
