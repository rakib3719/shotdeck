import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import { NextResponse } from 'next/server';
import ytdlp from 'yt-dlp-exec';
import ffmpegPath from 'ffmpeg-static';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const timestamp = searchParams.get('timestamp');

  if (!url || !timestamp) {
    return NextResponse.json({ error: 'url and timestamp are required' }, { status: 400 });
  }

  const cleanUrl = url.split('?')[0];
  const tempDir = tmp.dirSync({ unsafeCleanup: true });
  const outputImage = path.join(tempDir.name, 'thumb.jpg');

  try {
    const videoStreamURL = await ytdlp(cleanUrl, {
      getUrl: true,
      format: 'worst',
    });

    const ffmpegCmd = `"${ffmpegPath}" -ss ${timestamp} -i "${videoStreamURL}" -frames:v 1 -q:v 2 "${outputImage}" -y`;

    await new Promise((resolve, reject) => {
      exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()));
    });

    if (!fs.existsSync(outputImage)) {
      throw new Error('Output image not found');
    }

    const imageBuffer = fs.readFileSync(outputImage);
    tempDir.removeCallback();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Processing failed', details: err.message }, { status: 500 });
  }
}
