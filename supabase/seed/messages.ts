import { supabase } from './config';

export async function seedMessages() {
  console.log('💬 Creating sample messages...');

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

    // Get loans for loan-related messages
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('id, borrower_id');

    if (loansError) {
      console.error('❌ Error fetching loans:', loansError.message);
      return;
    }

    const bobLoan = loans?.find(l => l.borrower_id === bob.id);

    // Create sample messages
    const messages = [
      {
        sender_id: jane.id,
        receiver_id: john.id,
        content: 'Hi John! I need to borrow your drill for a weekend project. Is it available?'
      },
      {
        sender_id: john.id,
        receiver_id: jane.id,
        content: 'Sure Jane! You can pick it up anytime. Just let me know when you\'re coming.'
      }
    ];

    // Add loan-related message if loan exists
    if (bobLoan) {
      messages.push({
        sender_id: bob.id,
        receiver_id: jane.id,
        content: 'Thanks for the ladder! I\'ll return it by the 15th as agreed.',
        loan_id: bobLoan.id
      } as any);
    }

    const { data: createdMessages, error: messagesError } = await supabase
      .from('messages')
      .insert(messages)
      .select();

    if (messagesError) {
      console.error('❌ Error creating messages:', messagesError.message);
      return;
    }

    console.log(`✅ Created ${createdMessages.length} messages`);

  } catch (error) {
    console.error('❌ Unexpected error:', (error as Error).message);
  }
} 