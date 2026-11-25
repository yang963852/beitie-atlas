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
            float x=(v.x*width+offset)*.009;
            float t=time;
            // A slow meander, with the stream narrowing and widening downstream.
            float bend=.5+.115*sin(x*.62+t*.05)+.045*sin(x*1.35+.7);
            float radius=.205+.045*sin(x*.47-t*.035);
            float distanceToBank=abs(v.y-bend)/radius;
            float flow=(v.y-bend)/radius;
            float water=1.-smoothstep(.84,1.03,distanceToBank);
            // Bands and highlights drift along the current; the banks catch paper light.
            float drift=sin(flow*13.+x*1.9-t*.9);
            float ripple=sin(flow*29.+x*3.4-t*1.7+.7*sin(x*.9+t*.15));
            float glint=pow(max(ripple,0.),10.)*smoothstep(.1,.9,sin(x*.55-t*.55+flow*2.2));
            float current=.4*sin(flow*6.5+x*.6-t*.3)+.26*sin(x*1.15-t*.45);
            float fibre=.03*sin(x*26.+v.y*70.+t*.12);
            vec3 ink=mix(vec3(.58,.49,.37),vec3(.22,.155,.11),.48+.4*current+fibre);
            float rim=smoothstep(.88,1.,distanceToBank)*(1.-smoothstep(1.,1.1,distanceToBank));
            ink=mix(ink,vec3(.86,.80,.69),rim*.32);
            ink+=vec3(.16,.13,.10)*glint;
            float alpha=water*(.58+.18*current+.08*drift)+glint*.22;
            gl_FragColor=vec4(ink,clamp(alpha,0.,.94));
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
