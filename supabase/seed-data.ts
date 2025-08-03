import { createClient } from '@supabase/supabase-js';

// Supabase configuration for local development
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleData() {
  console.log('🚀 Creating sample data...');

  try {
    // Get user IDs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name');

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No users found. Please create users first.');
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    const john = users.find(u => u.first_name === 'John');
    const jane = users.find(u => u.first_name === 'Jane');
    const bob = users.find(u => u.first_name === 'Bob');

    if (!john || !jane || !bob) {
      console.error('❌ Missing required users (John, Jane, Bob)');
      return;
    }

    // Create sample tools
    const tools = [
      {
        owner_id: john.id,
        name: 'Cordless Drill',
        description: '18V DeWalt cordless drill with two batteries and charger',
        category: 'Power Tools',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1581147036325-d716c737bdf8?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: john.id,
        name: 'Circular Saw',
        description: '7-1/4 inch circular saw, perfect for cutting lumber',
        category: 'Power Tools',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1581147036325-d716c737bdf8?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: jane.id,
        name: 'Ladder',
        description: '6-foot aluminum extension ladder, lightweight and sturdy',
        category: 'Ladders & Scaffolding',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1581147036325-d716c737bdf8?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: jane.id,
        name: 'Pressure Washer',
        description: '2000 PSI electric pressure washer for cleaning driveways and decks',
        category: 'Cleaning',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1581147036325-d716c737bdf8?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: bob.id,
        name: 'Tool Set',
        description: 'Complete 100-piece tool set with case, includes wrenches, screwdrivers, and more',
        category: 'Hand Tools',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1581147036325-d716c737bdf8?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: bob.id,
        name: 'Lawn Mower',
        description: 'Self-propelled gas lawn mower, 21-inch cutting deck',
        category: 'Garden',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1581147036325-d716c737bdf8?w=400&h=300&fit=crop'],
        is_available: true
      }
    ];

    const { data: createdTools, error: toolsError } = await supabase
      .from('tools')
      .insert(tools)
      .select();

    if (toolsError) {
      console.error('❌ Error creating tools:', toolsError.message);
      return;
    }

    console.log(`✅ Created ${createdTools.length} tools`);

    // Create sample loans
    const drill = createdTools.find(t => t.name === 'Cordless Drill');
    const ladder = createdTools.find(t => t.name === 'Ladder');

    if (drill && ladder) {
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
      } else {
        console.log(`✅ Created ${createdLoans.length} loans`);
      }

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
        },
        {
          sender_id: bob.id,
          receiver_id: jane.id,
          content: 'Thanks for the ladder! I\'ll return it by the 15th as agreed.',
          loan_id: createdLoans ? createdLoans.find(l => l.borrower_id === bob.id)?.id : null
        }
      ];

      const { data: createdMessages, error: messagesError } = await supabase
        .from('messages')
        .insert(messages)
        .select();

      if (messagesError) {
        console.error('❌ Error creating messages:', messagesError.message);
      } else {
        console.log(`✅ Created ${createdMessages.length} messages`);
      }
    }

    console.log('🎉 Sample data creation complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', (error as Error).message);
  }
}

// Run the script
createSampleData().catch(console.error); 