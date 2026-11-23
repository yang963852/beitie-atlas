import * as T from 'three';
import { deskTexture } from './classroom-textures';

const ease = (n: number) => { const t = T.MathUtils.clamp(n, 0, 1); return t * t * (3 - 2 * t); };

export function createClassroom(canvas: HTMLCanvasElement, onReady: () => void) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color('#e0dfcf');
  scene.fog = new T.FogExp2('#e0dfcf', .072);
  const camera = new T.PerspectiveCamera(39, 1, .1, 100);
  const textures = (['oak', 'felt', 'paper', 'cover'] as const).map(deskTexture);
  const pigment = (color: string) => new T.MeshStandardMaterial({ color });
  const [oak, felt, paper, cover] = textures.map(map => new T.MeshStandardMaterial({ map }));
  const frame = pigment('#364842'), ivory = pigment('#e7e4d8'), bamboo = pigment('#ab743c');
  const ink = new T.MeshStandardMaterial({ color: '#151818', roughness: .17 });
  const boxShape = new T.BoxGeometry();
  function mesh(parent: T.Object3D, geometry: T.BufferGeometry, material: T.Material | T.Material[], x: number, y: number, z: number) {
    const item = new T.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.castShadow = item.receiveShadow = true;
    parent.add(item);
    return item;
  }
  function box(parent: T.Object3D, mat: T.Material | T.Material[], x: number, y: number, z: number, w: number, h: number, d: number) {
    const item = mesh(parent, boxShape, mat, x, y, z);
    item.scale.set(w, h, d);
    return item;
  }
  function desk(x: number, z: number, width: number, depth: number, parent: T.Object3D = scene) {
    box(parent, oak, x, -.12, z, width, .24, depth);
    for (const i of [-1, 1]) for (const j of [-1, 1])
      box(parent, frame, x + i * (width / 2 - .22), -1.1, z + j * (depth / 2 - .22), .12, 1.9, .12);
  }
  box(scene, ivory, 0, -2.1, -3, 35, .2, 34);
  box(scene, ivory, 0, 2, -12, 34, 10, .18);
  box(scene, frame, 1, 2, -11.8, 8, 2.9, .14);
  // Framed board, chalk ledge, storage shelves and ceiling strip lights.
  box(scene, oak, 1, .54, -11.55, 8.18, .09, .43);
  for (const x of [-3.08, 5.08]) box(scene, oak, x, 2, -11.73, .12, 3, .18);
  box(scene, oak, 1, 3.48, -11.73, 8.26, .1, .18);
  for (const y of [-1.7, -.9, -.1, .72]) box(scene, oak, 7.3, y, -8.2, 2.8, .09, .7);
  for (const x of [5.9,8.7]) box(scene, frame, x, -.6, -8.2, .08, 2.8, .7);
  const hanging = document.createElement('canvas');
  hanging.width = 256; hanging.height = 768;
  const lettering = hanging.getContext('2d')!;
  lettering.fillStyle = '#ded1ac'; lettering.fillRect(0,0,256,768);
  lettering.fillStyle = '#292c26'; lettering.textAlign = 'center';
  lettering.font = '138px KaiTi, serif';
  [...'ÓÀºÍ¾ÅÄê'].forEach((glyph,i) => lettering.fillText(glyph,128,173+i*145));
  lettering.fillStyle = '#984f36'; lettering.fillRect(174,657,25,30);
  const hangingMap = new T.CanvasTexture(hanging); hangingMap.colorSpace = T.SRGBColorSpace;
  textures.push(hangingMap);
  mesh(scene, new T.PlaneGeometry(.93,2.72), new T.MeshStandardMaterial({map:hangingMap}), -4.45, 1.93,-11.7);
  for (const y of [.52,3.33]) box(scene, oak,-4.45,y,-11.68,1.1,.09,.1);
  const glass = new T.MeshBasicMaterial({ color: '#fff9df' });
  for (let z = -11; z <= 8; z += 3) {
    box(scene, glass, -8, 2.6, z, .08, 4, 2.92);
    box(scene, frame, -7.9, 2.4, z, .09, .05, 3);
    box(scene, ivory, -7.9, .5, z, .45, .14, 3);
  }
  for (const z of [-8,-3]) {
    box(scene, ivory, .4, 5.1, z, 3.8, .12, .36).castShadow = false;
    box(scene, glass, .4, 5.03, z, 3.7, .03, .31).castShadow = false;
  }
  for (const z of [-8, -4.6]) for (const x of [-5, 0, 5]) {
    desk(x, z, 3.8, 1.65);
    box(scene, felt, x, .018, z, 2.9, .035, 1.28);
    box(scene, paper, x - .35, .05, z, 1.15, .025, .78);
    box(scene, oak, x, -1.05, z + 1.36, 1.15, .16, .82);
    box(scene, oak, x, -.52, z + 1.72, 1.15, .93, .12);
    for (const dx of [-.46,.46]) for (const dz of [-.3,.3])
      box(scene, frame, x+dx, -1.55, z+1.36+dz, .07, .9, .07);
  }
  const table = new T.Group();
  scene.add(table);
  desk(0, 0, 7.3, 4.5, table);
  box(table, felt, 0, .025, .02, 6.27, .05, 3.81);
  const sheets = new T.Group();
  sheets.rotation.y = -.043;
  scene.add(sheets);
  for (let i = 0; i < 4; i++) {
    box(sheets, paper, -.31 + i * .014, .059 + .01 * i, -.04, 4.26, .012, 2.86).rotation.y = .0025 * i;
  }
  const book = new T.Group();
  book.position.set(-1.54, .104, .24); book.rotation.y = -.16;
  scene.add(book);
  box(book, cover, 0, .017, 0, 1.25, .034, 1.78);
  box(book, ivory, .01, .068, 0, 1.21, .075, 1.73);
  box(book, cover, 0, .124, 0, 1.25, .038, 1.78);
  const glaze = new T.MeshStandardMaterial({ color: '#38423f', roughness: .27 });
  const bowl = new T.LatheGeometry([[0,0],[.43,0],[.53,.07],[.61,.2],[.61,.235],[.55,.25],[.51,.19],[.44,.09],[0,.08]].map(([x,y])=>new T.Vector2(x,y)), 64);
  const dish = new T.Group();
  scene.add(dish);
  mesh(dish, bowl, glaze, 0, .052, 0);
  mesh(dish, new T.CylinderGeometry(.52, .46, .045, 64), ink, 0, .20, 0);

  // The group's origin is the wet tip, shared with the ink's contact point.
  const brush = new T.Group();
  scene.add(brush);
  const hairs = new T.LatheGeometry([[0,0],[.028,.07],[.055,.18],[.067,.28],[.055,.36]].map(([x,y])=>new T.Vector2(x,y)), 32);
  mesh(brush, hairs, ink, 0, 0, 0);
  function shaft(y: number, length: number, radius: number, mat: T.Material) {
    mesh(brush, new T.CylinderGeometry(radius * .96, radius, length, 32), mat, 0, y, 0);
  }
  shaft(.42, .14, .065, frame); shaft(1.20, 1.46, .054, bamboo); shaft(1.94, .1, .056, frame);
  for (const y of [.48, .51, 1.85]) shaft(y, .014, .057, ivory);
  const rest = new T.Vector3(1.88, .325, .50);
  const contact = new T.Vector3(.42, .097, .39);
  const restRotation = new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0), new T.Vector3(.49,.03,-.88).normalize());
  const writingRotation = new T.Quaternion().setFromEuler(new T.Euler(-.28, 0, -.29));
  brush.position.copy(rest); brush.quaternion.copy(restRotation);

  scene.add(new T.HemisphereLight('#fff8e6', '#827b69', 1.55));
  const sun = new T.DirectionalLight('#fff0db', 1.72);
  sun.position.set(-5, 8, -4); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.normalBias = .008;
  scene.add(sun);
  let start = performance.now(), strike = 0, strikeIntro = 0, frameId = 0, ready = false;
  let visible = true;
  const duration = 2900;
  function cameraHeight() {
    const width = camera.aspect < .85 ? 4.45 : 5.9;
    return Math.max(4.5, width / camera.aspect) / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)));
  }
  function draw(now: number) {
    cancelAnimationFrame(frameId);
    const elapsed = strike ? (now - strike) / 1000 : 0;
    const travel = strike ? strikeIntro + (1 - strikeIntro) * ease(elapsed / .46) : ease((now - start) / duration);
    const height = cameraHeight();
    (scene.fog as T.FogExp2).density = T.MathUtils.lerp(.055, .009, travel);
    camera.position.set(T.MathUtils.lerp(3.3, 0, travel), T.MathUtils.lerp(Math.max(9.5,height+2), height, travel), T.MathUtils.lerp(10.8, .72, travel));
    camera.lookAt(0, 0, T.MathUtils.lerp(-4, 0, travel));
    if (strike) {
      const lift = ease(elapsed / .52);
      brush.position.lerpVectors(rest, contact, lift);
      brush.position.y += .86 * Math.sin(Math.PI * lift / 2) * (1 - ease((elapsed - .49) / .24));
      brush.quaternion.slerpQuaternions(restRotation, writingRotation, lift);
      brush.position.y += .28 * ease((elapsed - .79) / .28);
    }
    renderer.render(scene, camera);
    if (!ready && travel >= 1) { ready = true; onReady(); }
    if (visible && (travel < 1 || (strike && elapsed < 1.15))) frameId = requestAnimationFrame(draw);
  }
  function resize() {
    const {clientWidth: w, clientHeight: h} = canvas;
    if (!w || !h) return;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    const portrait = camera.aspect < .85;
    table.rotation.y = portrait ? Math.PI / 2 : 0;
    sheets.rotation.y = portrait ? 1.53 : -.043;
    book.position.set(portrait ? -.82 : -1.54, .104, portrait ? -.94 : .24);
    dish.position.set(portrait ? 1.38 : 2.32, 0, portrait ? -1.09 : -.12);
    rest.copy(dish.position).add(new T.Vector3(-.44,.325,.62));
    contact.set(portrait ? .05 : .42, .097, portrait ? .72 : .39);
    if (!strike) brush.position.copy(rest);
    renderer.setSize(w,h,false); draw(performance.now());
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas); resize();
  return {
    visibility(value: boolean) { visible = value; if (value) draw(performance.now()); else cancelAnimationFrame(frameId); },
    strike() {
      strike = performance.now(); strikeIntro = ease((strike - start) / duration);
      draw(strike);
      const endCamera = camera.clone();
      const height = cameraHeight();
      endCamera.position.set(0, height, .72); endCamera.lookAt(0,0,0); endCamera.updateMatrixWorld();
      const point = contact.clone().project(endCamera);
      return { x: (point.x+1)*50, y: (1-point.y)*50 };
    },
    reset() { strike = 0; start = performance.now() - duration; brush.position.copy(rest); brush.quaternion.copy(restRotation); draw(performance.now()); },
    dispose() {
      observer.disconnect(); cancelAnimationFrame(frameId);
      const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>();
      scene.traverse(obj => { if (obj instanceof T.Mesh) {
        geometries.add(obj.geometry);
        for (const mat of [obj.material].flat()) materials.add(mat);
      }});
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      textures.forEach(t => t.dispose()); sun.shadow.dispose(); renderer.dispose();
    }
  };
}
