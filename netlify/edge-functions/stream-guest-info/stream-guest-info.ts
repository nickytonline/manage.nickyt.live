import type { Context } from 'https://edge.netlify.com';

const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
const AIRTABLE_STREAM_GUEST_BASE_ID = Deno.env.get(
  'AIRTABLE_STREAM_GUEST_BASE_ID',
);

async function getStreamGuestUrl(streamDate: string) {
  const filterByFormula = encodeURIComponent(
    `AND(DATESTR({Date}) = "${streamDate}")`,
  );
  const fields = ['Name', 'Guest Title', 'Stream Title']
    .map(encodeURIComponent)
    .join('&fields[]=');

  const streamGuestInfoQueryUrl = `https://api.airtable.com/v0/${AIRTABLE_STREAM_GUEST_BASE_ID}/Stream%20Guests?filterByFormula=${filterByFormula}&fields[]=${fields}`;
  const response = await fetch(streamGuestInfoQueryUrl, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  const { records } = await response.json();

  let redirectUrl;

  if (records.length === 0) {
    redirectUrl = 'https://streamtastic.netlify.app/background.html';
  } else {
    const streamGuestInfo = records[0]?.fields;
    const encodedStreamTitle = encodeURIComponent(
      streamGuestInfo['Stream Title'],
    );
    const encodedGuestTitle = encodeURIComponent(
      `${streamGuestInfo.Name}, ${streamGuestInfo['Guest Title']}`,
    );

    redirectUrl = `/background.html?title=${encodedStreamTitle}&guest=${encodedGuestTitle}`;
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
