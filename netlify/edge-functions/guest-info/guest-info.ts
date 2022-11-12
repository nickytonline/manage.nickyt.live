import type { Context } from 'https://edge.netlify.com';

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
const AIRTABLE_STREAM_GUEST_BASE_ID = Deno.env.get(
  'AIRTABLE_STREAM_GUEST_BASE_ID',
);

async function getStreamGuestUrl(streamDate: string) {
  const filterByFormula = encodeURIComponent(
    `AND(DATESTR({Date}) = "${streamDate}")`,
  );

  // Generates querystring key value pairs that look like this, Name&fields[]=Guest%20Title&fields[]=Stream%20Title
  const fields = ['Name', 'Guest Title', 'Stream Title']
    .map(encodeURIComponent)
    .join('&fields[]=');

  // Uses the Airtable API's filterByFormula (see https://support.airtable.com/docs/how-to-sort-filter-or-retrieve-ordered-records-in-the-api)
  const streamGuestInfoQueryUrl = `https://api.airtable.com/v0/${AIRTABLE_STREAM_GUEST_BASE_ID}/Stream%20Guests?filterByFormula=${filterByFormula}&fields[]=${fields}`;
  const response = await fetch(streamGuestInfoQueryUrl, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  const { records } = await response.json();

  let redirectUrl = '/overlays/background';

  if (records.length > 0) {
    const streamGuestInfo = records[0]?.fields;
    const encodedStreamTitle = encodeURIComponent(
      streamGuestInfo['Stream Title'],
    );
    const encodedGuestTitle = encodeURIComponent(
      `${streamGuestInfo.Name}, ${streamGuestInfo['Guest Title']}`,
    );

    redirectUrl += `?title=${encodedStreamTitle}&guest=${encodedGuestTitle}`;
  }

  return redirectUrl;
}

export default async (_request: Request, context: Context) => {
  const today = new Date();
  const streamDate = today.toISOString().slice(0, 10);
  const redirectUrl = await getStreamGuestUrl(streamDate);

  context.log('Guest stream info redirect URL', redirectUrl);

  return new Response('The request to this URL was logged', {
    status: 302,
    headers: {
      Location: redirectUrl,
      // Cache for two minutes in case I need to adjust the guest info before a stream
      'Cache-Control': 'max-age=120',
    },
  });
};
