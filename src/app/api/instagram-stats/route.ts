import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

type InstagramStatEntry = {
  timestamp: string;
  followers: number;
  engagement: number;
};

const statsDir = path.join(process.cwd(), 'dashboard');
const statsFile = path.join(statsDir, 'stats.json');

async function ensureStatsFile() {
  await fs.mkdir(statsDir, { recursive: true });

  try {
    await fs.access(statsFile);
  } catch {
    await fs.writeFile(statsFile, '[]\n', 'utf8');
  }
}

async function readStats(): Promise<InstagramStatEntry[]> {
  await ensureStatsFile();

  const raw = await fs.readFile(statsFile, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item): item is InstagramStatEntry => {
    if (!item || typeof item !== 'object') return false;

    const candidate = item as Partial<InstagramStatEntry>;

    return (
      typeof candidate.timestamp === 'string' &&
      typeof candidate.followers === 'number' &&
      Number.isFinite(candidate.followers) &&
      typeof candidate.engagement === 'number' &&
      Number.isFinite(candidate.engagement)
    );
  });
}

async function writeStats(entries: InstagramStatEntry[]) {
  await fs.writeFile(statsFile, JSON.stringify(entries, null, 2) + '\n', 'utf8');
}

export async function GET() {
  try {
    const entries = await readStats();
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to read Instagram stats:', error);
    return NextResponse.json({ error: 'Failed to read stats.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<InstagramStatEntry>;

    const followers = Number(body.followers);
    const engagement = Number(body.engagement);

    if (!Number.isFinite(followers) || followers < 0) {
      return NextResponse.json({ error: 'followers must be a non-negative number.' }, { status: 400 });
    }

    if (!Number.isFinite(engagement) || engagement < 0) {
      return NextResponse.json({ error: 'engagement must be a non-negative number.' }, { status: 400 });
    }

    const entries = await readStats();

    const newEntry: InstagramStatEntry = {
      timestamp: new Date().toISOString(),
      followers,
      engagement,
    };

    const updated = [...entries, newEntry];

    await writeStats(updated);

    return NextResponse.json({ entry: newEntry, entries: updated });
  } catch (error) {
    console.error('Failed to save Instagram stats:', error);
    return NextResponse.json({ error: 'Failed to save stats.' }, { status: 500 });
  }
}
