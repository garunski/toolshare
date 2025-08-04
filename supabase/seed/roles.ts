import { supabase } from './config';

export async function seedRoles() {
  console.log('🔐 Setting up admin role...');

  try {
    // Get admin role
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      console.error('❌ Error fetching admin role:', roleError.message);
      return;
    }

    if (!adminRole) {
      console.error('❌ Admin role not found');
      return;
    }

    // Get John Doe user
    const { data: john, error: userError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('first_name', 'John')
      .eq('last_name', 'Doe')
      .single();

    if (userError || !john) {
      console.error('❌ Error fetching John Doe:', userError?.message);
      return;
    }

    // Check if John already has admin role
    const { data: existingRoles, error: checkError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', john.id)
      .eq('role_id', adminRole.id)
      .eq('is_active', true);

    if (checkError) {
      console.error('❌ Error checking existing admin role:', checkError.message);
      return;
    }

    if (existingRoles && existingRoles.length > 0) {
      console.log('ℹ️  John Doe already has admin role');
      return;
    }

    // Assign admin role to John
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: john.id,
        role_id: adminRole.id,
        is_active: true
      });

    if (assignError) {
      console.error('❌ Error assigning admin role:', assignError.message);
      return;
    }

    console.log('✅ Assigned admin role to John Doe');
    console.log('📧 Admin login: john@example.com / password123');

  } catch (error) {
    console.error('❌ Unexpected error:', (error as Error).message);
  }
} 