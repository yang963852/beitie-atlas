import { CanvasTexture, SRGBColorSpace } from 'three';

type Surface = 'oak' | 'felt' | 'paper' | 'cover';

export function deskTexture(surface: Surface) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;
  let seed = 2397;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  ctx.fillStyle = { oak: '#ae835c', felt: '#636d64', paper: '#f3dfab', cover: '#344a51' }[surface];
  ctx.fillRect(0, 0, 1024, 768);
  const wood = surface === 'oak';
  const pixels = ctx.getImageData(0, 0, 1024, 768);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const grain = (random() - .5) * (surface === 'felt' ? 43 : 17);
    for (let c = 0; c < 3; c++) pixels.data[i + c] += grain;
  }
  ctx.putImageData(pixels, 0, 0);
  ctx.strokeStyle = wood ? '#4d31192b' : '#574a391f';
  ctx.lineWidth = wood ? 1.3 : .8;
  for (let i = 0; i < (wood ? 2600 : 11000); i++) {
    const x = random() * 1100 - 76, y = random() * 768;
    const length = wood ? 60 + random() * 440 : 2 + random() * 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + length * .6, y + random() * 8, x + length, y + random() * 5 - 2);
    ctx.stroke();
  }
  if (surface === 'cover') {
    ctx.fillStyle = '#ebdbad';
    ctx.fillRect(648, 75, 170, 412);
    ctx.strokeStyle = '#72654f'; ctx.lineWidth = 3;
    ctx.strokeRect(656, 83, 154, 396);
    ctx.fillStyle = '#282b25'; ctx.textAlign = 'center';
    ctx.font = '100px KaiTi, "Kaiti SC", serif';
    [...'蘭亭序'].forEach((letter, i) => ctx.fillText(letter, 733, 200 + i * 112));
    ctx.strokeStyle = '#cdc8a7'; ctx.lineWidth = 6;
    for (const y of [72, 242, 512, 694]) {
      ctx.beginPath(); ctx.moveTo(0, y - 5); ctx.lineTo(86, y); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(86, 72); ctx.lineTo(86, 694); ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
