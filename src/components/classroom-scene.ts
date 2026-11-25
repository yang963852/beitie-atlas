import * as T from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import shenlongUrl from '../assets/shenlong-opening.webp';
import grainUrl from '../assets/wood-grain.webp';
import normalUrl from '../assets/wood-normal.webp';
import { writingHand } from './classroom-hand';
import { paperInk } from './paper-ink';
import { deskTexture } from './classroom-textures';

const ease = (n: number) => { const t = T.MathUtils.clamp(n, 0, 1); return t * t * (3 - 2 * t); };

export async function loadDeskImages() {
  return Promise.all([shenlongUrl, grainUrl, normalUrl].map(async url => {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }));
}

export function createClassroom(canvas: HTMLCanvasElement, onReady: () => void, images: HTMLImageElement[]) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  // A filmic curve keeps the warm paper highlights from clipping; the camera,
  // geometry and animation are untouched.
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  const scene = new T.Scene();
  scene.background = new T.Color('#e8e0cc');
  scene.fog = new T.FogExp2('#e8e0cc', .072);
  const camera = new T.PerspectiveCamera(39, 1, .1, 100);
  const [facsimile, grain, normal] = images.map(image => {
    const texture = new T.Texture(image);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    return texture;
  });
  facsimile.colorSpace = grain.colorSpace = T.SRGBColorSpace;
  const wool = deskTexture('felt'), fibre = deskTexture('paper');
  const textures = [facsimile, grain, normal, wool, fibre];
  const pigment = (color: string) => new T.MeshStandardMaterial({ color });
  const oak = new T.MeshStandardMaterial({map:grain, normalMap:normal, normalScale:new T.Vector2(.48,.48), roughness:.62});
  const felt = new T.MeshStandardMaterial({map:wool,bumpMap:wool,bumpScale:.0016,roughness:1});
  const paper = new T.MeshStandardMaterial({map:fibre,bumpMap:fibre,bumpScale:.00065,roughness:.96});
  const frame = pigment('#3b352b'), ivory = pigment('#e2d6ba');
  const bamboo = new T.MeshStandardMaterial({color:'#d6b078',map:grain,roughness:.39});
  const ink = new T.MeshPhysicalMaterial({color:'#070808',roughness:.095,clearcoat:1,clearcoatRoughness:.05});
  const studio = new RoomEnvironment();
  const pmrem = new T.PMREMGenerator(renderer);
  const reflections = pmrem.fromScene(studio,.04);
  scene.environment = reflections.texture;
  scene.environmentIntensity = .42;
  studio.dispose(); pmrem.dispose();
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
  [...'永和九年'].forEach((glyph,i) => lettering.fillText(glyph,128,173+i*145));
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
  box(table, felt, 0, .025, 0, 7.3, .05, 4.5);
  const sheets = new T.Group();
  scene.add(sheets);
  for (let i = 0; i < 4; i++) {
    box(sheets, paper, -.31 + i * .014, .059 + .01 * i, -.04, 4.26, .012, 2.86);
  }
  // Fine irregularities on the exposed edge of the top sheet catch grazing light.
  const topSheet = new T.PlaneGeometry(4.26,2.86,180,100);
  const edge = topSheet.attributes.position;
  for (let i=0; i<edge.count; i++) {
    const x=edge.getX(i), y=edge.getY(i);
    const ripple=.003*Math.sin(x*79+y*91)+.005*Math.sin(x*38-y*27);
    if (Math.abs(x)>2.12) edge.setX(i,x+ripple);
    if (Math.abs(y)>1.42) edge.setY(i,y+ripple);
    edge.setZ(i,.003*Math.sin(x*5+y*2)+.004*Math.cos(x*2-y*3));
  }
  topSheet.computeVertexNormals();
  const top = mesh(sheets,topSheet,paper,-.263,.101,-.04);
  top.rotation.x=-Math.PI/2;
  const book = new T.Group();
  book.position.set(-1.54, .104, .24); book.rotation.y = -.074;
  scene.add(book);
  // Six concertina leaves carry contiguous slices of the same credited plate.
  const board = pigment('#393f39'), pageEdge = pigment('#d9c9a7');
  box(book,board,-.15,.016,0,2.70,.032,1.84);
  const titleStrip = document.createElement('canvas');
  titleStrip.width = 128; titleStrip.height = 512;
  const label = titleStrip.getContext('2d')!;
  label.fillStyle = '#424b44'; label.fillRect(0,0,128,512);
  label.fillStyle = '#e4d6b4'; label.fillRect(38,42,58,241);
  label.fillStyle = '#332e24'; label.textAlign = 'center';
  label.font = '49px "Kaiti SC", STKaiti, KaiTi, serif';
  [...'蘭亭序'].forEach((glyph,i) => label.fillText(glyph,67,106+60*i));
  const coverTexture = new T.CanvasTexture(titleStrip);
  coverTexture.colorSpace = T.SRGBColorSpace; textures.push(coverTexture);
  const cover = mesh(book,new T.PlaneGeometry(.36,1.80),
    new T.MeshStandardMaterial({map:coverTexture,roughness:.94}),-1.32,.061,0);
  cover.rotation.x = -Math.PI/2;
  for (let i=0; i<4; i++) box(book,i%2 ? ivory : pageEdge,0,.04+i*.009,0,2.35,.009,1.80);
  const bookWidth = 2.28, folds = 6;
  const leaf = new T.PlaneGeometry(bookWidth,1.76,folds*8,8);
  const vertices = leaf.attributes.position;
  for (let i=0; i<vertices.count; i++) {
    const u = (vertices.getX(i)/bookWidth+.5)*folds;
    const ridge = 1 - Math.abs(1 - ((u+2)%2));
    vertices.setZ(i,.16*ridge+.007*Math.cos(2*Math.PI*u));
  }
  // Unshared normals keep a definite ridge where two folded leaves meet.
  const creased = leaf.toNonIndexed();
  leaf.dispose();
  creased.computeVertexNormals();
  const plate = mesh(book,creased,new T.MeshStandardMaterial({map:facsimile,roughness:.97,side:T.DoubleSide}),0,.080,0);
  plate.rotation.x = -Math.PI/2;
  const glaze = new T.MeshPhysicalMaterial({color:'#393832',roughness:.27,clearcoat:.82,clearcoatRoughness:.19});
  const bowl = new T.LatheGeometry([[0,0],[.43,0],[.53,.07],[.61,.2],[.61,.235],[.55,.25],[.51,.19],[.44,.09],[0,.08]].map(([x,y])=>new T.Vector2(x,y)), 64);
  const dish = new T.Group();
  scene.add(dish);
  mesh(dish, bowl, glaze, 0, .052, 0);
  mesh(dish, new T.CylinderGeometry(.52, .46, .045, 64), ink, 0, .20, 0);

  // The group's origin is the wet tip, shared with the ink's contact point.
  const brush = new T.Group();
  scene.add(brush);
  const hairs = new T.LatheGeometry([[0,0],[.028,.07],[.055,.18],[.067,.28],[.055,.36]].map(([x,y])=>new T.Vector2(x,y)), 32);
  const bristleColors = [];
  const bristle = new T.Color(), rootColor = new T.Color('#ad976d');
  for (let i=0; i<hairs.attributes.position.count; i++) {
    const u=hairs.attributes.uv.getX(i), y=hairs.attributes.position.getY(i);
    const dry = Math.max(0,(y-.17)/.19);
    bristle.set('#171814').lerp(rootColor,dry*(.54+.27*Math.sin(87*u)));
    bristleColors.push(bristle.r,bristle.g,bristle.b);
  }
  hairs.setAttribute('color',new T.Float32BufferAttribute(bristleColors,3));
  mesh(brush,hairs,new T.MeshStandardMaterial({vertexColors:true,roughness:.36}),0,0,0);
  function shaft(y: number, length: number, radius: number, mat: T.Material) {
    mesh(brush, new T.CylinderGeometry(radius * .96, radius, length, 32), mat, 0, y, 0);
  }
  shaft(.42, .14, .065, frame); shaft(1.20, 1.46, .054, bamboo); shaft(1.94, .1, .056, frame);
  for (const y of [.48, .51, 1.85]) shaft(y, .014, .057, ivory);
  const hand = writingHand();
  scene.add(hand);
  const grip = new T.Vector3(), flyIn = new T.Vector3();
  const stain = paperInk(); scene.add(stain.mark);
  const rest = new T.Vector3(1.88, .325, .50);
  const contact = new T.Vector3(.42, .112, .39);
  const restRotation = new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0), new T.Vector3(.58,-.125,.80).normalize());
  const writingRotation = new T.Quaternion().setFromEuler(new T.Euler(-.28, 0, -.29));
  brush.position.copy(rest); brush.quaternion.copy(restRotation);

  scene.add(new T.HemisphereLight('#fff7e4', '#7d7361', 1.12));
  const sun = new T.DirectionalLight('#ffedcf', 1.5);
  sun.position.set(-5, 8, -4); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.normalBias = .008;
  scene.add(sun);
  let start = performance.now(), strike = 0, strikeIntro = 0, frameId = 0, ready = false;
  let visible = true;
  const duration = 2900;
  const closeup = new T.Vector3();
  const textAnchor = new T.Vector3();
  function locateLettering() {
    camera.updateMatrixWorld();
    const portrait = camera.aspect < .85;
    textAnchor.set(portrait ? -.14 : .70, .12, portrait ? .96 : -.20).project(camera);
    const surface = canvas.parentElement;
    surface?.style.setProperty('--sheet-x', (50+50*textAnchor.x)+'%');
    surface?.style.setProperty('--sheet-y', (50-50*textAnchor.y)+'%');
    const sheetWidth = portrait ? 2.49 : 1.96;
    const pixels = canvas.clientWidth*sheetWidth/(2*cameraHeight()*Math.tan(T.MathUtils.degToRad(camera.fov/2))*camera.aspect);
    surface?.style.setProperty('--letter-width', pixels+'px');
  }
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
      const approach = ease((elapsed - 1.29) / 1.32);
      camera.position.lerp(closeup.set(contact.x, .24, contact.z+.012), approach);
      camera.lookAt(contact.x*approach,contact.y*approach,T.MathUtils.lerp(-4*(1-travel),contact.z,approach));
      const carry = ease((elapsed-.38)/.65);
      const lower = ease((elapsed-1.01)/.23);
      const liftOff = ease((elapsed-1.33)/.48);
      brush.position.lerpVectors(rest,contact,carry);
      brush.position.y += .71*Math.sin(Math.PI*carry/2)*(1-lower) + .69*liftOff;
      brush.position.x += .12*liftOff;
      brush.quaternion.slerpQuaternions(restRotation,writingRotation,carry);
      hand.visible = true;
      grip.set(0,.64,0).applyQuaternion(brush.quaternion).add(brush.position);
      flyIn.set(2.7,1.20,1.05).multiplyScalar(1-ease(elapsed/.40));
      hand.position.copy(grip).add(flyIn);
      hand.rotation.set(-.07+.10*lower,.12-.24*carry,.12-.17*lower);
    }
    stain.age.value = Math.max(0,elapsed-1.24);
    stain.mark.visible = stain.age.value > 0;
    stain.mark.position.set(contact.x,contact.y+.003,contact.z);
    if (!strike && travel >= 1) locateLettering();
    renderer.render(scene, camera);
    if (!ready && travel >= 1) { ready = true; onReady(); }
    if (visible && (travel < 1 || (strike && elapsed < 2.95))) frameId = requestAnimationFrame(draw);
  }
  function resize() {
    const {clientWidth: w, clientHeight: h} = canvas;
    if (!w || !h) return;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    const portrait = camera.aspect < .85;
    table.rotation.y = portrait ? Math.PI / 2 : 0;
    sheets.rotation.y = portrait ? Math.PI / 2 : 0;
    book.position.set(portrait ? -.78 : -1.78, .104, portrait ? -1.02 : .10);
    dish.position.set(portrait ? 1.40 : 2.34, 0, portrait ? -1.53 : -.87);
    rest.copy(dish.position).add(new T.Vector3(-.05,.29,.40));
    contact.set(portrait ? .05 : .42, .112, portrait ? .72 : .39);
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
    reset() { hand.visible = false; strike = 0; start = performance.now() - duration; brush.position.copy(rest); brush.quaternion.copy(restRotation); draw(performance.now()); },
    dispose() {
      observer.disconnect(); cancelAnimationFrame(frameId);
      const geometries = new Set<T.BufferGeometry>(), materials = new Set<T.Material>();
      scene.traverse(obj => { if (obj instanceof T.Mesh) {
        geometries.add(obj.geometry);
        for (const mat of [obj.material].flat()) materials.add(mat);
      }});
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      reflections.dispose(); textures.forEach(t => t.dispose()); sun.shadow.dispose(); renderer.dispose();
    }
  };
}
