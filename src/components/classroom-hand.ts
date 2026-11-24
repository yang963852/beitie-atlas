import * as T from 'three';

type Point = [x: number, y: number, z: number, width: number, depth: number];

// A continuous, tapered surface along each finger avoids visible ball joints.
// Local origin is the pinch between the thumb and index finger.
function contour(points: Point[]) {
  const path = new T.CatmullRomCurve3(points.map(([x,y,z]) => new T.Vector3(x,y,z)));
  const rings = (points.length - 1) * 6, sides = 16;
  const frame = path.computeFrenetFrames(rings, false);
  const positions: number[] = [], indices: number[] = [];
  for (let ring = 0; ring <= rings; ring++) {
    const t = ring / rings;
    const centre = path.getPointAt(t);
    const offset = path.getUtoTmapping(t, 0) * (points.length - 1);
    const i = Math.min(points.length - 2, Math.floor(offset));
    const width = T.MathUtils.lerp(points[i][3], points[i+1][3], offset-i);
    const depth = T.MathUtils.lerp(points[i][4], points[i+1][4], offset-i);
    for (let j = 0; j < sides; j++) {
      const angle = 2 * Math.PI * j / sides;
      const v = centre.clone()
        .addScaledVector(frame.normals[ring], width * Math.cos(angle))
        .addScaledVector(frame.binormals[ring], depth * Math.sin(angle));
      positions.push(v.x, v.y, v.z);
      if (ring === rings) continue;
      const a = ring*sides+j, b = ring*sides+(j+1)%sides;
      indices.push(a,b,a+sides,b,b+sides,a+sides);
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function writingHand() {
  const hand = new T.Group();
  const skin = new T.MeshStandardMaterial({color:'#c68f72',roughness:.88});
  const cuff = new T.MeshStandardMaterial({color:'#4a4036',roughness:.98});
  function part(points: Point[], material: T.Material = skin) {
    const mesh = new T.Mesh(contour(points), material);
    mesh.castShadow = mesh.receiveShadow = true;
    hand.add(mesh);
  }
  // The hand is seen from the back. Wrist runs into a loose cloth cuff.
  part([[.24,.09,.03,.09,.11],[.38,.10,.09,.14,.20],[.54,.09,.18,.135,.20],
    [.72,.07,.26,.105,.14],[.95,.06,.35,.11,.15]]);
  part([[.75,.07,.275,.12,.16],[.78,.07,.29,.145,.18],[.87,.075,.33,.14,.18],
    [1.45,.08,.59,.18,.21],[2.4,.09,.99,.22,.26]],cuff);
  // Thumb and index pad touch opposite sides of a 0.054-radius shaft.
  part([[.44,.085,.19,.10,.10],[.32,.035,.18,.087,.09],[.19,-.016,.14,.068,.072],
    [.085,-.02,.08,.060,.06],[.025,-.007,.062,.030,.035],[.013,-.005,.060,.005,.005]]);
  part([[.34,.14,-.04,.087,.085],[.23,.22,-.10,.073,.073],[.115,.19,-.105,.060,.065],
    [.05,.095,-.085,.055,.060],[.018,.043,-.064,.032,.038],[.014,.036,-.058,.005,.005]]);
  part([[.42,.11,-.085,.081,.083],[.29,.105,-.18,.07,.076],[.17,.035,-.18,.062,.063],
    [.11,-.06,-.13,.052,.052],[.065,-.093,-.065,.027,.035],[.061,-.094,-.057,.005,.005]]);
  part([[.49,.065,-.085,.073,.075],[.38,.035,-.20,.064,.065],[.28,-.055,-.21,.057,.058],
    [.26,-.106,-.12,.046,.05],[.265,-.11,-.085,.005,.005]]);
  part([[.53,.025,-.055,.064,.064],[.49,-.025,-.155,.052,.054],[.41,-.095,-.15,.047,.049],
    [.41,-.118,-.085,.029,.032],[.415,-.119,-.072,.005,.005]]);
  hand.visible = false;
  return hand;
}
