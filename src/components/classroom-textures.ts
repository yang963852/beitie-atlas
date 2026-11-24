import { CanvasTexture, SRGBColorSpace } from 'three';

export function deskTexture(surface: 'felt' | 'paper') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;
  let seed = 2397;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  const wool = surface === 'felt';
  ctx.fillStyle = wool ? '#55503f' : '#decfae';
  ctx.fillRect(0, 0, 1024, 768);
  // Soft clumps beneath individual strands break up the uniform digital grain.
  for (let i = 0; i < 560; i++) {
    const x = random()*1024, y = random()*768, r = 9 + 67*random();
    const cloud = ctx.createRadialGradient(x,y,0,x,y,r);
    cloud.addColorStop(0, random()>.5 ? '#efe4c40a' : '#37372c08');
    cloud.addColorStop(1,'transparent');
    ctx.fillStyle = cloud; ctx.fillRect(x-r,y-r,2*r,2*r);
  }
  for (let i = 0; i < (wool ? 120000 : 23500); i++) {
    const x = random()*1024, y = random()*768;
    const angle = random()*Math.PI + .48*Math.sin(x/70+y/180);
    const length = (wool ? 1.8 : 2.4) + random()*(wool ? 9 : 16);
    const dx = length*Math.cos(angle), dy = length*Math.sin(angle);
    ctx.strokeStyle = random()>.48 ? (wool ? '#ebe8d32e' : '#fff7d52e') : (wool ? '#141b1838' : '#79644729');
    ctx.lineWidth = .42 + random()*.72;
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x+dx*.5-dy*.17,y+dy*.5+dx*.17,x+dx,y+dy); ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
