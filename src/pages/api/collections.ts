import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { transformFishEntry, transformPlantEntry, transformTankEntry } from '@/services/collections';

export const GET: APIRoute = async () => {
  try {
    const [fishEntries, plantEntries, tankEntries] = await Promise.all([
      getCollection('fish'),
      getCollection('plants'),
      getCollection('tanks')
    ]);

    const transformedData = {
      fish: fishEntries.map(entry => transformFishEntry(entry)),
      plants: plantEntries.map(entry => transformPlantEntry(entry)),
      tanks: tankEntries.map(entry => transformTankEntry(entry))
    };

    return new Response(JSON.stringify(transformedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch collections' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
