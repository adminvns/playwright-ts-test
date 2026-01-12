import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Database health check test
 * Performs periodic queries to maintain database connectivity
 */

interface DatabaseRecord {
    [key: string]: any;
}
const DB_TABLE = (process.env.DB_TABLE_NAME as string);
const DB_PRIMARY_KEY = (process.env.DB_PRIMARY_KEY as string);

test.describe('Database Health Check', () => {
    let supabase: ReturnType<typeof createClient>;

    test.beforeAll(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey || !DB_TABLE || !DB_PRIMARY_KEY) {
            throw new Error('Missing required environment variables (URL, Key, Table Name, or Primary Key)');
        }

        supabase = createClient(supabaseUrl, supabaseAnonKey);
    });

    test('should execute database query successfully', async () => {
        const { data, error, count } = await supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact', head: false })
            .limit(1);

        expect(error).toBeNull();

        if (data && data.length > 0) {
            const record = data[0] as DatabaseRecord;
            expect(record).toHaveProperty(DB_PRIMARY_KEY);
        }
    });

    test('should verify database connection', async () => {
        const { error } = await supabase
            .from(DB_TABLE)
            .select(DB_PRIMARY_KEY)
            .limit(1);

        expect(error).toBeNull();
    });

    test('should retrieve record count', async () => {
        const { count, error } = await supabase
            .from(DB_TABLE)
            .select('*', { count: 'exact', head: true });

        expect(error).toBeNull();
        expect(count).toBeGreaterThanOrEqual(0);
    });
});
