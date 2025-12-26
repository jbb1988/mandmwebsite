import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get database stats
    const [
      connectionStats,
      tableStats,
      indexStats,
      slowQueries,
      dbSize
    ] = await Promise.all([
      // Active connections
      supabase.rpc('exec_sql', {
        sql: `
          SELECT
            count(*) as active_connections,
            current_setting('max_connections')::int as max_connections
          FROM pg_stat_activity
          WHERE state = 'active'
        `
      }),
      // Table stats
      supabase.rpc('exec_sql', {
        sql: `
          SELECT
            schemaname,
            relname as table_name,
            n_live_tup as row_count,
            n_dead_tup as dead_tuples,
            last_vacuum,
            last_autovacuum,
            last_analyze,
            last_autoanalyze,
            pg_size_pretty(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(relname))) as total_size,
            pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(relname)) as size_bytes
          FROM pg_stat_user_tables
          WHERE schemaname = 'public'
          ORDER BY pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(relname)) DESC
          LIMIT 30
        `
      }),
      // Index usage
      supabase.rpc('exec_sql', {
        sql: `
          SELECT
            schemaname,
            relname as table_name,
            indexrelname as index_name,
            idx_scan as scans,
            idx_tup_read as tuples_read,
            idx_tup_fetch as tuples_fetched,
            pg_size_pretty(pg_relation_size(indexrelid)) as index_size
          FROM pg_stat_user_indexes
          WHERE schemaname = 'public'
          ORDER BY idx_scan DESC
          LIMIT 20
        `
      }),
      // Recent slow queries (from pg_stat_statements if available)
      (async () => {
        try {
          return await supabase.rpc('exec_sql', {
            sql: `
              SELECT
                query,
                calls,
                total_exec_time / 1000 as total_time_sec,
                mean_exec_time as mean_time_ms,
                rows
              FROM pg_stat_statements
              WHERE mean_exec_time > 100
              ORDER BY mean_exec_time DESC
              LIMIT 10
            `
          });
        } catch {
          return { data: [] };
        }
      })(),
      // Database size
      supabase.rpc('exec_sql', {
        sql: `
          SELECT
            pg_size_pretty(pg_database_size(current_database())) as database_size,
            pg_database_size(current_database()) as size_bytes
        `
      })
    ]);

    // Get tables needing vacuum (high dead tuple ratio)
    const vacuumNeeded = tableStats.data?.filter((t: any) =>
      t.dead_tuples > 1000 || (t.row_count > 0 && t.dead_tuples / t.row_count > 0.1)
    ) || [];

    // Get RLS status for tables
    const { data: rlsStatus } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `
    });

    return NextResponse.json({
      connections: connectionStats.data?.[0] || { active_connections: 0, max_connections: 100 },
      tables: tableStats.data || [],
      indexes: indexStats.data || [],
      slowQueries: slowQueries.data || [],
      databaseSize: dbSize.data?.[0] || { database_size: '0 bytes', size_bytes: 0 },
      vacuumNeeded,
      rlsStatus: rlsStatus || []
    });
  } catch (error) {
    console.error('Error fetching database stats:', error);
    return NextResponse.json({ error: 'Failed to fetch database stats' }, { status: 500 });
  }
}
