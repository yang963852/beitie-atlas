import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';

// Paper coordinates stay fixed as water advances. Fine fibres lead the wash,
// while the heavier pigment remains concentrated at the brush impression.
export function paperInk() {
  const age = { value: 0 };
  const material = new ShaderMaterial({
    uniforms: { age }, transparent: true, depthWrite: false,
    vertexShader: `
      varying vec2 paper;
      void main() {
        paper = uv - 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }`,
    fragmentShader: `
      varying vec2 paper;
      uniform float age;
      float hash(vec2 p) {
        vec3 v = fract(p.xyx * .1031);
        v += dot(v, v.yzx + 33.33);
        return fract((v.x+v.y)*v.z);
      }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
                   mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
      }
      void main() {
        vec2 p = mat2(.94,.34,-.34,.94)*paper;
        float grain = noise(220.*p);
        float fibre = noise(p*vec2(44.,195.));
        float uneven = .62*noise(13.*p+4.) + .26*noise(46.*p) + .12*fibre;
        float d = length(p*vec2(.89,1.23)) * (1.30-.59*uneven) + .007*(.5-grain);
        float water = .020 + .33*sqrt(1.-exp(-1.85*age));
        float pigment = .013 + .21*(1.-exp(-2.6*age));
        float fringe = 1.-smoothstep(water-.063,water+.016,d);
        float body = 1.-smoothstep(.012,pigment+.034,d);
        float tide = exp(-70.*abs(d-water+.018))*fringe;
        float density = fringe*(.22+.11*fibre+.05*grain+.34*(1.-smoothstep(.01,water,d))) + .74*body + .12*tide;
        gl_FragColor = vec4(.045,.044,.037,clamp(density,0.,.98)*smoothstep(0.,.035,age));
      }`
  });
  const mark = new Mesh(new PlaneGeometry(1.21,1.21), material);
  mark.rotation.x = -Math.PI/2;
  mark.visible = false;
  return { mark, age };
}
