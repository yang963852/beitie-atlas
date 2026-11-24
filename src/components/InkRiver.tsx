import { useEffect, useRef } from 'react';

/** Draw only the visible reach, keeping the current continuous as the rail scrolls. */
export function InkRiver() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    const rail = element?.parentElement?.querySelector('.atlas-rail');
    if (!element || !rail || !window.WebGL2RenderingContext) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import('three').then(THREE => {
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const uniforms = { width: { value: 1 }, offset: { value: 0 }, time: { value: 0 } };
      const material = new THREE.ShaderMaterial({
        uniforms, transparent: true, depthTest: false,
        vertexShader: 'varying vec2 v; void main(){v=uv; gl_Position=vec4(position.xy,0.,1.);}',
        fragmentShader: `
          varying vec2 v;
          uniform float width, offset, time;
          void main(){
            float x=(v.x*width+offset)*.011;
            float bend=.5+.14*sin(x*.79)+.07*sin(x*1.6+.8);
            float radius=.19+.05*sin(x*.53);
            float distanceToBank=abs(v.y-bend)/radius;
            float flow=(v.y-bend)/radius;
            float eddy=sin(x*1.37-time*.23+flow*4.)+.6*sin(x*2.1+flow*3.);
            float ripple=sin(flow*21.+eddy*2.3+sin(x-time*.32));
            float glint=pow(max(ripple,0.),7.)*smoothstep(-.6,.8,sin(x*.85+flow*9.));
            float current=.45*sin(flow*7.+eddy)+.3*sin(x*.8-flow*5.);
            float water=1.-smoothstep(.88,1.02,distanceToBank);
            float fibre=.045*sin(x*23.+v.y*80.);
            vec3 ink=mix(vec3(.62,.54,.41),vec3(.28,.19,.13),.5+.48*current+fibre);
            gl_FragColor=vec4(ink,water*(.72+.19*current-.38*glint));
          }`,
      });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const scene = new THREE.Scene();
      scene.add(new THREE.Mesh(geometry, material));
      const camera = new THREE.Camera();
      element.append(renderer.domElement);
      const draw = () => {
        uniforms.offset.value = rail.scrollLeft;
        renderer.render(scene, camera);
      };
      const resize = () => {
        uniforms.width.value = element.clientWidth;
        renderer.setSize(element.clientWidth, element.clientHeight);
        draw();
      };
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      let visible = false;
      const animate = () => renderer.setAnimationLoop(visible && !media.matches ? ms => {
        uniforms.time.value = ms / 1000;
        draw();
      } : null);
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; animate(); });
      visibility.observe(element);
      const observer = new ResizeObserver(resize);
      observer.observe(element);
      resize();
      media.addEventListener('change', animate);
      rail.addEventListener('scroll', draw, { passive: true });
      cleanup = () => {
        renderer.setAnimationLoop(null);
        rail.removeEventListener('scroll', draw);
        media.removeEventListener('change', animate);
        visibility.disconnect(); observer.disconnect();
        geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* The static waterline remains available without WebGL. */ });
    return () => { disposed = true; cleanup?.(); };
  }, []);
  return <div className="ink-river" aria-hidden="true" ref={host} />;
}
