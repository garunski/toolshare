import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

export async function seedExternalTaxonomy() {
  console.log('📚 Creating sample external taxonomy...');

  const sampleTaxonomy = [
    // Level 1 - Root Categories
    { external_id: 1001, category_path: 'Power Tools', parent_id: null, level: 1 },
    { external_id: 1002, category_path: 'Hand Tools', parent_id: null, level: 1 },
    { external_id: 1003, category_path: 'Garden & Outdoor', parent_id: null, level: 1 },
    { external_id: 1004, category_path: 'Automotive', parent_id: null, level: 1 },
    { external_id: 1005, category_path: 'Measurement & Precision', parent_id: null, level: 1 },
    { external_id: 1006, category_path: 'Safety & Protection', parent_id: null, level: 1 },
    { external_id: 1007, category_path: 'Hardware & Fasteners', parent_id: null, level: 1 },
    { external_id: 1008, category_path: 'Cleaning & Maintenance', parent_id: null, level: 1 },

    // Level 2 - Power Tools Subcategories
    { external_id: 2001, category_path: 'Power Tools > Drills & Drivers', parent_id: 1001, level: 2 },
    { external_id: 2002, category_path: 'Power Tools > Saws', parent_id: 1001, level: 2 },
    { external_id: 2003, category_path: 'Power Tools > Sanders', parent_id: 1001, level: 2 },
    { external_id: 2004, category_path: 'Power Tools > Grinders', parent_id: 1001, level: 2 },

    // Level 2 - Hand Tools Subcategories
    { external_id: 2005, category_path: 'Hand Tools > Screwdrivers', parent_id: 1002, level: 2 },
    { external_id: 2006, category_path: 'Hand Tools > Hammers', parent_id: 1002, level: 2 },
    { external_id: 2007, category_path: 'Hand Tools > Pliers', parent_id: 1002, level: 2 },
    { external_id: 2008, category_path: 'Hand Tools > Wrenches', parent_id: 1002, level: 2 },

    // Level 2 - Garden & Outdoor Subcategories
    { external_id: 2009, category_path: 'Garden & Outdoor > Lawn Care', parent_id: 1003, level: 2 },
    { external_id: 2010, category_path: 'Garden & Outdoor > Landscaping', parent_id: 1003, level: 2 },
    { external_id: 2011, category_path: 'Garden & Outdoor > Irrigation', parent_id: 1003, level: 2 },

    // Level 2 - Automotive Subcategories
    { external_id: 2012, category_path: 'Automotive > Engine Tools', parent_id: 1004, level: 2 },
    { external_id: 2013, category_path: 'Automotive > Body & Paint', parent_id: 1004, level: 2 },
    { external_id: 2014, category_path: 'Automotive > Electrical', parent_id: 1004, level: 2 },

    // Level 3 - Specific Categories
    { external_id: 3001, category_path: 'Power Tools > Drills & Drivers > Cordless Drills', parent_id: 2001, level: 3 },
    { external_id: 3002, category_path: 'Power Tools > Drills & Drivers > Impact Drivers', parent_id: 2001, level: 3 },
    { external_id: 3003, category_path: 'Power Tools > Saws > Circular Saws', parent_id: 2002, level: 3 },
    { external_id: 3004, category_path: 'Power Tools > Saws > Jigsaws', parent_id: 2002, level: 3 },
    { external_id: 3005, category_path: 'Hand Tools > Screwdrivers > Phillips Head', parent_id: 2005, level: 3 },
    { external_id: 3006, category_path: 'Hand Tools > Screwdrivers > Flat Head', parent_id: 2005, level: 3 },
    { external_id: 3007, category_path: 'Garden & Outdoor > Lawn Care > Lawn Mowers', parent_id: 2009, level: 3 },
    { external_id: 3008, category_path: 'Garden & Outdoor > Lawn Care > Trimmers', parent_id: 2009, level: 3 },
  ];

  try {
    // Clear existing taxonomy data
    const { error: deleteError } = await supabase
      .from('external_product_taxonomy')
      .delete()
      .neq('external_id', 0);

    if (deleteError) {
      console.error('❌ Error clearing existing taxonomy:', deleteError.message);
      return;
    }

    // Insert sample taxonomy data
    const { error: insertError } = await supabase
      .from('external_product_taxonomy')
      .insert(sampleTaxonomy.map(item => ({
        ...item,
        is_active: true,
        last_updated: new Date().toISOString(),
      })));

    if (insertError) {
      console.error('❌ Error inserting taxonomy data:', insertError.message);
      return;
    }

    console.log(`✅ Created ${sampleTaxonomy.length} external taxonomy categories`);

  } catch (error) {
    console.error('❌ Error during external taxonomy seeding:', (error as Error).message);
  }
}
