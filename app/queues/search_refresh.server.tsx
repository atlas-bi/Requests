import { Queue } from 'quirrel/remix';
import { prisma } from '~/db.server';
import {
  clearSearch,
  loadLabels,
  loadUsers,
  searchSettings,
  userIndex,
} from '~/search.server';

// triggered by user refresh when it completes.
export default Queue('/queues/search_refresh', async (job) => {
  console.log('loading search');

  await clearSearch();
  await searchSettings();

  loadUsers();
  await loadLabels();
});