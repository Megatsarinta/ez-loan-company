import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getClientIP, getLocationFromIP } from '@/lib/ip-location';
import { Client } from 'pg';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ipAddress: passedIp } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Use client IP passed from auth route (real client); internal fetch would see server IP
    const ipAddress = passedIp && passedIp !== 'Unknown' ? passedIp : getClientIP(req);
    const location = await getLocationFromIP(ipAddress);

    let locationString = 'Unknown';
    if (location.city !== 'Unknown' || location.country !== 'Unknown') {
      if (location.country === 'India') {
        locationString = location.city && location.region
          ? `${location.city}, ${location.region}, India`
          : location.city
            ? `${location.city}, India`
            : 'India';
      } else {
        locationString = location.city && location.country
          ? `${location.city}, ${location.country}`
          : location.country || 'Unknown';
      }
    } else {
      locationString = `Unknown, IP: ${ipAddress}`;
    }

    // Try Supabase first (when users table has last_login_* columns)
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        last_login_ip: ipAddress,
        last_login_location: locationString,
        last_login_at: new Date().toISOString(),
        last_login_country: location.country || 'Unknown',
      })
      .eq('id', userId);

    if (error) {
      // Schema cache or missing columns - try direct PG to persist IP and location
      const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (dbUrl) {
        try {
          const client = new Client({ connectionString: dbUrl });
          await client.connect();
          await client.query(
            `UPDATE public.users SET last_login_ip = $2, last_login_location = $3, last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
            [userId, ipAddress, locationString]
          );
          await client.end();
          console.log(`[v0] Tracked login via PG for user ${userId}: ${locationString} (${ipAddress})`);
        } catch (pgErr) {
          try {
            const client = new Client({ connectionString: dbUrl });
            await client.connect();
            await client.query('UPDATE public.users SET updated_at = NOW() WHERE id = $1', [userId]);
            await client.end();
          } catch (_) {
            // Ignore; tracking is optional
          }
        }
      }
      // Don't fail the request: login already succeeded
    } else {
      console.log(`[v0] Tracked login for user ${userId}: ${locationString} (${ipAddress})`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Track login error:', error);
    // Return 200 so login flow is not broken
    return NextResponse.json({ success: true });
  }
}