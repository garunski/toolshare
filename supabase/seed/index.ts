import { seedUsers } from './users';
import { seedTools } from './tools';
import { seedLoans } from './loans';
import { seedMessages } from './messages';
import { seedRoles } from './roles';
import { seedExternalTaxonomy } from './externalTaxonomy';

export async function runAllSeeds() {
  console.log('🚀 Starting seed data creation...');

  try {
    // Run seeds in dependency order
    await seedUsers();
    await seedTools();
    await seedLoans();
    await seedMessages();
    await seedRoles();
    await seedExternalTaxonomy();

    console.log('🎉 All seed data creation complete!');

  } catch (error) {
    console.error('❌ Error during seed data creation:', (error as Error).message);
  }
}

// Run if called directly
if (require.main === module) {
  runAllSeeds().catch(console.error);
} 