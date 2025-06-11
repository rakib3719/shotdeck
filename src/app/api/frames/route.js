// app/api/frames/route.js

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const timestamp = searchParams.get('timestamp');

  if (!url || !timestamp) {
    return NextResponse.json(
      { error: 'Both url and timestamp are required' },
      { status: 400 }
    );
  }

  const cleanUrl = url.split('?')[0]; // Remove ?si=... or other query strings
  const tempDir = tmp.dirSync({ unsafeCleanup: true });
  const outputImage = path.join(tempDir.name, 'frame.jpg');

  // Step 1: Get direct stream URL using yt-dlp
const ytdlCmd = `yt-dlp -f best[ext=mp4] -g "${cleanUrl}"`;


  return new Promise((resolve) => {
    exec(ytdlCmd, (err, stdout, stderr) => {
      if (err) {
        console.error('yt-dlp error:', stderr || err.message);
        tempDir.removeCallback();
        return resolve(
          NextResponse.json(
            { error: 'yt-dlp failed', details: stderr || err.message },
            { status: 500 }
          )
        );
      }

      const videoStreamURL = stdout.trim();
      if (!videoStreamURL) {
        tempDir.removeCallback();
        return resolve(
          NextResponse.json({ error: 'Video URL not found' }, { status: 500 })
        );
      }

      // Step 2: Extract frame using ffmpeg
      const ffmpegCmd = `ffmpeg -ss ${timestamp} -i "${videoStreamURL}" -frames:v 1 -q:v 2 "${outputImage}" -y`;

      exec(ffmpegCmd, (err, _stdout, ffmpegErr) => {
        if (err || !fs.existsSync(outputImage)) {
          console.error('ffmpeg error:', ffmpegErr || err.message);
          tempDir.removeCallback();
          return resolve(
            NextResponse.json(
              { error: 'ffmpeg failed', details: ffmpegErr || err.message },
              { status: 500 }
            )
          );
        }

        // Step 3: Send the JPEG response
        const imageBuffer = fs.readFileSync(outputImage);
        tempDir.removeCallback();

        return resolve(
          new NextResponse(imageBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          })
        );
      });
    });
  });
}
