import { supabase } from './config';

export async function seedLoans() {
  console.log('📋 Creating sample loans...');

  try {
    // Get users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const john = users?.find(u => u.first_name === 'John');
    const jane = users?.find(u => u.first_name === 'Jane');
    const bob = users?.find(u => u.first_name === 'Bob');

    if (!john || !jane || !bob) {
      console.error('❌ Missing required users');
      return;
    }

    // Get tools
    const { data: tools, error: toolsError } = await supabase
      .from('tools')
      .select('id, name');

    if (toolsError) {
      console.error('❌ Error fetching tools:', toolsError.message);
      return;
    }

    const drill = tools?.find(t => t.name === 'Cordless Drill');
    const ladder = tools?.find(t => t.name === 'Ladder');

    if (!drill || !ladder) {
      console.error('❌ Missing required tools');
      return;
    }

    // Create sample loans
    const loans = [
      {
        tool_id: drill.id,
        borrower_id: jane.id,
        lender_id: john.id,
        status: 'completed',
        start_date: '2024-01-15',
        end_date: '2024-01-20'
      },
      {
        tool_id: ladder.id,
        borrower_id: bob.id,
        lender_id: jane.id,
        status: 'active',
        start_date: '2024-02-01',
        end_date: '2024-02-15'
      }
    ];

    const { data: createdLoans, error: loansError } = await supabase
      .from('loans')
      .insert(loans)
      .select();

    if (loansError) {
      console.error('❌ Error creating loans:', loansError.message);
      return;
    }

    console.log(`✅ Created ${createdLoans.length} loans`);
    return createdLoans;

  } catch (error) {
    console.error('❌ Unexpected error:', (error as Error).message);
  }
} 