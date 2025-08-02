import { createClient } from '@supabase/supabase-js';

// Supabase configuration for local development
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  {
    email: 'john@example.com',
    password: 'password123',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1-555-0101',
    address: '123 Main St, Anytown, USA',
    bio: 'Handyman and DIY enthusiast. Love sharing tools with the community!'
  },
  {
    email: 'jane@example.com',
    password: 'password123',
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+1-555-0102',
    address: '456 Oak Ave, Somewhere, USA',
    bio: 'Professional contractor. Always happy to help neighbors with their projects.'
  },
  {
    email: 'bob@example.com',
    password: 'password123',
    first_name: 'Bob',
    last_name: 'Wilson',
    phone: '+1-555-0103',
    address: '789 Pine Rd, Elsewhere, USA',
    bio: 'Home improvement hobbyist. Building a better community one tool at a time.'
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...');
  
  for (const user of testUsers) {
    try {
      // Try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            first_name: user.first_name,
            last_name: user.last_name
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`ℹ️  User ${user.email} already exists, skipping...`);
          continue;
        } else {
          console.error(`❌ Error creating user ${user.email}:`, authError.message);
          continue;
        }
      }

      console.log(`✅ Created user: ${user.email} (ID: ${authData.user?.id})`);

      // Update profile with additional information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: user.phone,
          address: user.address,
          bio: user.bio
        })
        .eq('id', authData.user?.id);

      if (profileError) {
        console.error(`⚠️  Error updating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Updated profile for: ${user.email}`);
      }

    } catch (error) {
      console.error(`❌ Unexpected error creating user ${user.email}:`, (error as Error).message);
    }
  }

  console.log('🎉 Test user creation complete!');
  console.log('\n📋 Test Credentials:');
  testUsers.forEach(user => {
    console.log(`   ${user.email} / ${user.password}`);
  });
}

// Run the script
createTestUsers().catch(console.error); 