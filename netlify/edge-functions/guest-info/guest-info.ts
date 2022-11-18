interface StreamGuestInfo {
  guestName: string;
  guestTitle: string;
  streamTitle: string;
}

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

  const streamGuestInfo: StreamGuestInfo = {
    guestName: records[0]?.fields.Name,
    guestTitle: records[0]?.fields['Guest Title'],
    streamTitle: records[0]?.fields['Stream Title'],
  };

  return streamGuestInfo;
}

function buildPage(streamGuestInfo: StreamGuestInfo) {
  const {
    guestName = 'NO GUEST!!!!!!',
    guestTitle = 'NO GUEST TITLE!!!!!!',
    streamTitle = 'NO STREAM TITLE!!!!!!',
  } = streamGuestInfo;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stream Guest Info</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/modern-css-reset/dist/reset.min.css"
    />
    <style>
      body {
        font-family: 'Bai Jamjuree';
        font-weight: bold;
      }
    </style>
    <link rel="stylesheet" href="/styles/guest-info.css" />
  </head>
  <body>
    <main class="angled-panel">
      <h1 id="title">${streamTitle}</h1>
      <h2 id="guest">${guestName}, ${guestTitle}</h2>
    </main>
    <footer class="footer">
      <p class="logo">
        iamdeveloper<span class="live"><span class="dot">.</span>live</span>
      </p>
    </footer>
  </body>
</html>
`;
}

export default async (_request: Request) => {
  const today = new Date();
  const streamDate = today.toISOString().slice(0, 10);
  const streamGuestInfo = await getStreamGuestUrl(streamDate);

  return new Response(buildPage(streamGuestInfo), {
    status: 200,
    headers: {
      // Cache for two minutes in case I need to adjust the guest info before a stream
      'Cache-Control': 'max-age=120',
      'Content-Type': 'text/html',
    },
  });
};
