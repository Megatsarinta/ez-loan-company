import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const url = new URL(req.url);
        const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50;
        const type = url.searchParams.get('type');

        // Build query
        let query = supabase
            .from('transactions')
            .select('*')
            .eq('user_id', parseInt(userId))
            .order('created_at', { ascending: false })
            .limit(limit);

        // Filter by transaction type if provided
        if (type) {
            query = query.eq('type', type);
        }

        const { data: transactions, error } = await query;

        if (error) {
            console.error('[v0] Transactions fetch error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch transactions' },
                { status: 500 }
            );
        }

        // Format transactions with Indian currency
        const formattedTransactions = transactions?.map(tx => ({
            ...tx,
            amount_formatted: `₹${tx.amount?.toLocaleString('en-IN')}`,
            currency: tx.currency || 'INR'
        })) || [];

        return NextResponse.json({
            transactions: formattedTransactions,
            total: formattedTransactions.length
        });
    } catch (error) {
        console.error('[v0] Transactions API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { type, amount, description, metadata } = await req.json();

        if (!type || !amount || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: type, amount, description' },
                { status: 400 }
            );
        }

        // Validate transaction type
        const validTypes = ['manual_deposit', 'loan_disbursement', 'withdrawal', 'repayment', 'refund'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: 'Invalid transaction type' },
                { status: 400 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                user_id: parseInt(userId),
                type,
                amount,
                description,
                metadata: metadata || {},
                currency: 'INR',
                created_at: now
            }])
            .select()
            .single();

        if (error) {
            console.error('[v0] Transaction creation error:', error);
            return NextResponse.json(
                { error: 'Failed to create transaction' },
                { status: 500 }
            );
        }

        // Format response with Indian currency
        const formattedTransaction = {
            ...data,
            amount_formatted: `₹${data.amount?.toLocaleString('en-IN')}`
        };

        return NextResponse.json({
            success: true,
            transaction: formattedTransaction,
            message: 'Transaction created successfully'
        });
    } catch (error) {
        console.error('[v0] Transactions API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('user_id')?.value;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const transactionId = url.searchParams.get('id');

        if (!transactionId) {
            return NextResponse.json(
                { error: 'Transaction ID is required' },
                { status: 400 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Verify transaction belongs to user
        const { data: existingTx, error: checkError } = await supabase
            .from('transactions')
            .select('id')
            .eq('id', parseInt(transactionId))
            .eq('user_id', parseInt(userId))
            .single();

        if (checkError || !existingTx) {
            return NextResponse.json(
                { error: 'Transaction not found or access denied' },
                { status: 404 }
            );
        }

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', parseInt(transactionId))
            .eq('user_id', parseInt(userId));

        if (error) {
            console.error('[v0] Transaction deletion error:', error);
            return NextResponse.json(
                { error: 'Failed to delete transaction' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('[v0] Transactions API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}