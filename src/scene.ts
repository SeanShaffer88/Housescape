import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {boundary,wallFootprint,wallBands,type Project} from './geometry';
export function createScene(host:HTMLElement) {
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));host.append(renderer.domElement);
  renderer.setClearColor('#eef0ec');
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,200);
  camera.position.set(11,12,14);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(3,0,2);controls.enableDamping=true;
  scene.add(new THREE.HemisphereLight(0xffffff,0x70776a,2.8));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(3,12,7);scene.add(light);
  const grid=new THREE.GridHelper(30,30,0xc7cec5,0xdce1d9);grid.position.y=-.02;scene.add(grid);
  let model=new THREE.Group();scene.add(model);
  const observer=new ResizeObserver(()=>{const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});observer.observe(host);
  const loop=()=>{controls.update();renderer.render(scene,camera);};renderer.setAnimationLoop(loop);
  function update(p:Project,selected:string){
    scene.remove(model);model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});model=new THREE.Group();scene.add(model);
    const shape=new THREE.Shape(boundary(p).map(v=>new THREE.Vector2(v.x,-v.y))),floor=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color:0xd8c8ad,side:THREE.DoubleSide}));floor.rotation.x=-Math.PI/2;floor.position.y=-.005;model.add(floor);
    for(const w of p.walls)for(const band of wallBands(p,w)) {
      const poly=wallFootprint(p,w,band.t0,band.t1),s=new THREE.Shape(poly.map(v=>new THREE.Vector2(v.x,-v.y)));
      const geometry=new THREE.ExtrudeGeometry(s,{depth:band.top-band.bottom,bevelEnabled:false});
      geometry.rotateX(-Math.PI/2);geometry.translate(0,band.bottom,0);
      const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:w.id===selected?0x77a997:0xf8f5ec,roughness:.85}));model.add(mesh);
    }
  }
  return {update,reset:()=>{camera.position.set(11,12,14);controls.target.set(3,0,2);controls.update();}};
}
