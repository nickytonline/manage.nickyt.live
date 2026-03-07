import { createClient } from 'npm:@libsql/client/http';

interface StreamGuestInfo {
  guestName: string;
  guestTitle: string;
  streamTitle: string;
}

const TURSO_DATABASE_URL = Deno.env.get('TURSO_DATABASE_URL');
const TURSO_AUTH_TOKEN = Deno.env.get('TURSO_AUTH_TOKEN');

async function getStreamGuestInfo(streamDate: string) {
  const client = createClient({
    url: TURSO_DATABASE_URL!,
    authToken: TURSO_AUTH_TOKEN!,
  });

  const result = await client.execute({
    sql: `SELECT guest_name, guest_title, title FROM stream_guests
          WHERE on_schedule = 1
            AND DATE(date) = ?
          LIMIT 1`,
    args: [streamDate],
  });

  const row = result.rows[0] as unknown as Record<string, unknown> | undefined;

  const streamGuestInfo: StreamGuestInfo = {
    guestName: row?.guest_name as string,
    guestTitle: row?.guest_title as string,
    streamTitle: row?.title as string,
  };

  return streamGuestInfo;
}

function buildPage(streamGuestInfo: StreamGuestInfo) {
  const {
    guestName = 'NO GUEST!!!!!!',
    guestTitle,
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
    <header class="angled-panel">
      <h1 id="title">${streamTitle}</h1>
      <h2 id="guest">${guestName}${guestTitle ? `, ${guestTitle}` : ''}</h2>
    </header>
    <main>
      <div class="melt">🫠</div>
    </main>
    <footer class="footer">
      <p class="logo">
        nickyt<span class="live"><span class="dot">.</span>live</span>
      </p>
    </footer>
  </body>
</html>
`;
}

export default async (_request: Request) => {
  const today = new Date();
  const streamDate = today.toISOString().slice(0, 10);
  const streamGuestInfo = await getStreamGuestInfo(streamDate);

  return new Response(buildPage(streamGuestInfo), {
    status: 200,
    headers: {
      // Cache for five minutes in case I need to adjust the guest info before a stream
      'Cache-Control': 'max-age=300',
      'Content-Type': 'text/html',
    },
  });
};
