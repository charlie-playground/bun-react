import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

async function latestByPrefix(dir: string, prefix: string) {
  const files = await readdir(dir);
  const candidates = files.filter(f => f.startsWith(prefix) && f.endsWith(".png"));
  if (candidates.length === 0) throw new Error(`No files found with prefix ${prefix}`);
  const withTime = await Promise.all(
    candidates.map(async f => ({ f, mtime: (await stat(join(dir, f))).mtimeMs }))
  );
  withTime.sort((a, b) => b.mtime - a.mtime);
  return join(dir, withTime[0].f);
}

async function compare() {
  const dir = "screenshots";
  const hnPath = await latestByPrefix(dir, "hn-");
  const localPath = await latestByPrefix(dir, "screenshot-");

  const [hnBuf, localBuf] = await Promise.all([readFile(hnPath), readFile(localPath)]);
  const hn = PNG.sync.read(hnBuf);
  const loc = PNG.sync.read(localBuf);

  if (hn.width !== loc.width || hn.height !== loc.height) {
    throw new Error(`Dimension mismatch: hn=${hn.width}x${hn.height} vs local=${loc.width}x${loc.height}`);
  }

  const { width, height } = hn;
  const diff = new PNG({ width, height });
  const mismatch = pixelmatch(hn.data, loc.data, diff.data, width, height, { threshold: 0.0 });

  const diffPath = join(dir, "diff.png");
  await writeFile(diffPath, PNG.sync.write(diff));
  console.log(`Compared images. Pixel differences: ${mismatch}. Diff saved: ${diffPath}`);
  if (mismatch === 0) {
    console.log("EXACT MATCH ✅");
  } else {
    console.log("NOT AN EXACT MATCH ❌");
    process.exitCode = 1;
  }
}

compare().catch(err => {
  console.error(err);
  process.exit(1);
});
