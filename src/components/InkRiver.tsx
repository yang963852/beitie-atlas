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
            // A broad meander; the course drifts and the channel widens downstream.
            float bend=.5+.108*sin(x*.5+t*.05)+.038*sin(x*1.25+.7);
            float radius=.315+.045*sin(x*.4-t*.03);
            float distanceToBank=abs(v.y-bend)/radius;
            float flow=(v.y-bend)/radius;
            float water=1.-smoothstep(.88,1.04,distanceToBank);
            // Two long swell trains roll towards later years, one riding on the other.
            float swell=.5+.5*sin(flow*3.2+x*.9-t*1.25);
            float chop=.5+.5*sin(flow*5.8-x*1.45-t*1.9+1.25*sin(x*.35+t*.1));
            float roll=.58*swell+.42*chop;
            // Whitecaps gather where both crests meet, in slow pulses along the reach.
            float crest=smoothstep(.62,.88,roll);
            float pulse=clamp(.55+.45*sin(x*.4-t*.55+flow*.8),0.,1.);
            float edge=smoothstep(.62,1.,distanceToBank)*(1.-smoothstep(1.,1.12,distanceToBank));
            float foam=crest*pulse*(.6+.4*edge);
            float lace=smoothstep(.78,.94,chop)*smoothstep(.4,.7,swell);
            foam=max(foam,lace*.5);
            // Broken white rims outline the leading edge of each swell.
            float rimSwell=smoothstep(.72,.78,swell)*(1.-smoothstep(.82,.9,swell));
            float rimChop=smoothstep(.8,.86,chop)*(1.-smoothstep(.88,.94,chop));
            foam=max(foam,rimSwell*clamp(.45+.55*sin(x*3.8-t*2.2+flow*5.6),0.,1.)*.7);
            foam=max(foam,rimChop*clamp(.5+.5*sin(x*4.6-t*2.8),0.,1.)*.35);
            foam=max(foam,edge*smoothstep(.4,.95,sin(x*.65-t*.45+flow*1.1))*.75);
            foam=clamp(foam,0.,1.);
            // Depth: classic indigo midstream, pale mineral blue in the shallows.
            float centre=1.-smoothstep(.08,.95,distanceToBank);
            vec3 deep=vec3(.035,.14,.30);
            vec3 mid=vec3(.085,.28,.47);
            vec3 pale=vec3(.4,.62,.76);
            vec3 colour=mix(pale,mid,smoothstep(0.,.5,centre));
            colour=mix(colour,deep,smoothstep(.25,1.,centre));
            // The swell turns the surface: shadowed troughs deepen, crests lift.
            colour=mix(colour,deep,.38*smoothstep(.15,.85,swell)*centre);
            colour=mix(colour,pale,.2*smoothstep(.45,.95,chop)*centre);
            // A fine surface ripple keeps the current alive between the swells.
            float ripple=.5+.5*sin(flow*10.-x*1.6-t*2.6);
            colour*=.965+.07*ripple*centre;
            colour=mix(colour,vec3(.94,.97,.98),foam*.92);
            // A pale lace outlines the highest crests.
            float crestLine=smoothstep(.9,.99,roll)*centre;
            colour=mix(colour,vec3(.94,.97,.98),crestLine*.45);
            // Slow era bands deepen the water as the course runs on.
            float era=.5+.5*sin(x*.3-t*.08+flow*.9);
            colour*=.92+.08*era;
            // The waterline catches a pale rim where the current meets the paper.
            float rim=smoothstep(.9,1.01,distanceToBank)*(1.-smoothstep(1.01,1.1,distanceToBank));
            colour=mix(colour,vec3(.84,.89,.92),rim*.38);
            float alpha=water*(.76+.1*centre)+foam*.24;
            gl_FragColor=vec4(colour,clamp(alpha,0.,.95));
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
