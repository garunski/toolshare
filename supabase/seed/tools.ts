import { supabase } from './config';

export async function seedTools() {
  console.log('🔧 Creating sample tools...');

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
        images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: john.id,
        name: 'Circular Saw',
        description: '7-1/4 inch circular saw, perfect for cutting lumber',
        category: 'Power Tools',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: jane.id,
        name: 'Ladder',
        description: '6-foot aluminum extension ladder, lightweight and sturdy',
        category: 'Ladders & Scaffolding',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: jane.id,
        name: 'Pressure Washer',
        description: '2000 PSI electric pressure washer for cleaning driveways and decks',
        category: 'Cleaning',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: bob.id,
        name: 'Tool Set',
        description: 'Complete 100-piece tool set with case, includes wrenches, screwdrivers, and more',
        category: 'Hand Tools',
        condition: 'Excellent',
        images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop'],
        is_available: true
      },
      {
        owner_id: bob.id,
        name: 'Lawn Mower',
        description: 'Self-propelled gas lawn mower, 21-inch cutting deck',
        category: 'Garden',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=400&h=300&fit=crop'],
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
    return createdTools;

  } catch (error) {
    console.error('❌ Unexpected error:', (error as Error).message);
  }
} 