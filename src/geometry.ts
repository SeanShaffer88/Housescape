/** Geometry uses metres and radians. A project is one simple CCW boundary loop.
 * Shared node IDs keep connected walls joined. Positive sweep curves left.
 * This prototype is intentionally not a general multi-room topology solver. */
export type Point = { x: number; y: number };
export type Opening = { id: string; offset: number; width: number; sill: number; height: number };
export type Wall = { id: string; start: string; end: string; thickness: number; height: number; sweep: number; openings: Opening[] };
export type Project = { version: 1; name: string; nodes: Record<string, Point>; walls: Wall[] };
export const EPS = 1e-8;
const add = (a: Point,b: Point):Point=>({x:a.x+b.x,y:a.y+b.y});
const sub = (a: Point,b: Point):Point=>({x:a.x-b.x,y:a.y-b.y});
const mul = (a: Point,n:number):Point=>({x:a.x*n,y:a.y*n});
const cross = (a:Point,b:Point)=>a.x*b.y-a.y*b.x;
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export function arc(p:Project,w:Wall) {
  const a=p.nodes[w.start],b=p.nodes[w.end],d=distance(a,b),s=w.sweep;
  const mid=mul(add(a,b),.5), n={x:-(b.y-a.y)/d,y:(b.x-a.x)/d};
  const center=add(mid,mul(n,d/(2*Math.tan(s/2))));
  return {center,radius:d/(2*Math.sin(Math.abs(s)/2)),angle:Math.atan2(a.y-center.y,a.x-center.x)};
}
export function wallLength(p:Project,w:Wall) {return Math.abs(w.sweep)<EPS?distance(p.nodes[w.start],p.nodes[w.end]):arc(p,w).radius*Math.abs(w.sweep);}
export function pointAt(p:Project,w:Wall,t:number):Point {
  if(Math.abs(w.sweep)<EPS) return add(p.nodes[w.start],mul(sub(p.nodes[w.end],p.nodes[w.start]),t));
  const a=arc(p,w),theta=a.angle+w.sweep*t;
  return add(a.center,{x:a.radius*Math.cos(theta),y:a.radius*Math.sin(theta)});
}
export function tangentAt(p:Project,w:Wall,t:number):Point {
  if(Math.abs(w.sweep)<EPS) {const d=sub(p.nodes[w.end],p.nodes[w.start]);return mul(d,1/Math.hypot(d.x,d.y));}
  const a=arc(p,w),theta=a.angle+w.sweep*t,s=Math.sign(w.sweep);
  return {x:-Math.sin(theta)*s,y:Math.cos(theta)*s};
}
function sidePoint(p:Project,w:Wall,t:number,side:number):Point {
  const c=pointAt(p,w,t),d=tangentAt(p,w,t),v=add(c,mul({x:-d.y,y:d.x},side*w.thickness/2));
  if(t>EPS&&t<1-EPS) return v;
  const other=p.walls.find(o=>o.id!==w.id&&(t<EPS?o.end===w.start:o.start===w.end));
  if(!other) return v;
  const od=tangentAt(p,other,t<EPS?1:0),ov=add(c,mul({x:-od.y,y:od.x},side*other.thickness/2));
  const det=cross(d,od);
  if(Math.abs(det)<EPS)return v;
  const hit=add(v,mul(d,cross(sub(ov,v),od)/det));
  // Bevel extreme joins rather than producing unbounded spikes.
  return distance(hit,c)>4*Math.max(w.thickness,other.thickness)?v:hit;
}
export function wallFootprint(p:Project,w:Wall,t0=0,t1=1):Point[] {
  const steps=Math.max(1,Math.ceil(Math.abs(w.sweep)*(t1-t0)/(.025)));
  const ts=Array.from({length:steps+1},(_,i)=>t0+(t1-t0)*i/steps);
  return [...ts.map(t=>sidePoint(p,w,t,1)),...ts.reverse().map(t=>sidePoint(p,w,t,-1))];
}
export function roomArea(p:Project) {
  return p.walls.reduce((sum,w)=>{
    const a=p.nodes[w.start],b=p.nodes[w.end];
    const segment=Math.abs(w.sweep)<EPS?0:arc(p,w).radius**2*(w.sweep-Math.sin(w.sweep))/2;
    return sum+cross(a,b)/2+segment;
  },0);
}
/** Solid wall bands leave a genuine opening in the 3D geometry. */
export function wallBands(p:Project,w:Wall) {
  const length=wallLength(p,w),bands:{t0:number;t1:number;bottom:number;top:number}[]=[];
  let cursor=0;
  for(const o of [...w.openings].sort((a,b)=>a.offset-b.offset)) {
    if(o.offset>cursor)bands.push({t0:cursor/length,t1:o.offset/length,bottom:0,top:w.height});
    if(o.sill>0)bands.push({t0:o.offset/length,t1:(o.offset+o.width)/length,bottom:0,top:o.sill});
    if(o.sill+o.height<w.height)bands.push({t0:o.offset/length,t1:(o.offset+o.width)/length,bottom:o.sill+o.height,top:w.height});
    cursor=o.offset+o.width;
  }
  if(cursor<length)bands.push({t0:cursor/length,t1:1,bottom:0,top:w.height});
  return bands;
}
export function boundary(p:Project):Point[] {
  return p.walls.flatMap(w=>{const n=Math.max(1,Math.ceil(Math.abs(w.sweep)/.025));return Array.from({length:n},(_,i)=>pointAt(p,w,i/n));});
}
function intersects(a:Point,b:Point,c:Point,d:Point) {
  const ab=sub(b,a),cd=sub(d,c),den=cross(ab,cd);
  if(Math.abs(den)<EPS) {
    if(Math.abs(cross(sub(c,a),ab))>EPS)return false;
    const axis=Math.abs(ab.x)>Math.abs(ab.y)?'x':'y';
    return Math.min(Math.max(a[axis],b[axis]),Math.max(c[axis],d[axis]))>=Math.max(Math.min(a[axis],b[axis]),Math.min(c[axis],d[axis]))-EPS;
  }
  const t=cross(sub(c,a),cd)/den,u=cross(sub(c,a),ab)/den;
  return t>=-EPS&&t<=1+EPS&&u>=-EPS&&u<=1+EPS;
}
export function validate(p:Project):void {
  if(!p||p.version!==1||typeof p.name!=='string'||!p.nodes||!Array.isArray(p.walls)||p.walls.length<3||p.walls.length>128)throw Error('Expected a version 1 room with 3–128 walls.');
  const ids=new Set<string>(),openingIds=new Set<string>();
  for(const w of p.walls) {
    if(!w||typeof w.id!=='string'||ids.has(w.id))throw Error('Wall IDs must be unique.');ids.add(w.id);
    const a=p.nodes[w.start],b=p.nodes[w.end];
    if(!a||!b||![a.x,a.y,b.x,b.y,w.thickness,w.height,w.sweep].every(Number.isFinite))throw Error('Geometry must contain finite numbers.');
    if(Math.max(Math.abs(a.x),Math.abs(a.y),Math.abs(b.x),Math.abs(b.y))>1000||distance(a,b)<.1||w.thickness<.05||w.thickness>1||w.height<.2||w.height>10||Math.abs(w.sweep)>Math.PI*.95)throw Error('Wall dimensions are outside prototype limits.');
    if(w.end!==p.walls[(p.walls.indexOf(w)+1)%p.walls.length].start)throw Error('Walls must form one ordered closed loop.');
    if(!Array.isArray(w.openings)||w.openings.length>32)throw Error('Invalid opening list.');
    if(Math.abs(w.sweep)>EPS&&arc(p,w).radius<=w.thickness/2)throw Error('Wall curve is too tight.');
    let end=0;
    for(const o of [...w.openings].sort((a,b)=>a.offset-b.offset)) {
      if(!o||typeof o.id!=='string'||openingIds.has(o.id)||![o.offset,o.width,o.sill,o.height].every(Number.isFinite)||o.offset<end+0.05||o.width<.1||o.sill<0||o.height<.1||o.sill+o.height>w.height||o.offset+o.width>wallLength(p,w)-.05)throw Error('Openings must fit the wall and remain separated.');
      openingIds.add(o.id);end=o.offset+o.width;
    }
  }
  if(roomArea(p)<=.1)throw Error('Room must have positive area and counterclockwise walls.');
  const pts=boundary(p);
  if(pts.length>2048)throw Error('Room exceeds the prototype curve-complexity limit.');
  for(let i=0;i<pts.length;i++)for(let j=i+2;j<pts.length;j++) {
    if(i===0&&j===pts.length-1)continue;
    if(intersects(pts[i],pts[(i+1)%pts.length],pts[j],pts[(j+1)%pts.length]))throw Error('Room boundary cannot cross or touch itself.');
  }
}
export function setLength(p:Project,id:string,length:number):Project {
  if(!Number.isFinite(length)||length<.1||length>50)throw Error('Enter a length from 0.1 to 50 metres.');
  const next=structuredClone(p),w=next.walls.find(w=>w.id===id)!;
  const a=next.nodes[w.start],b=next.nodes[w.end],ratio=length/wallLength(next,w);
  next.nodes[w.end]=add(a,mul(sub(b,a),ratio));validate(next);return next;
}
export class History {
  private past:Project[]=[];private future:Project[]=[];
  constructor(public current:Project){validate(current);this.current=structuredClone(current);}
  commit(next:Project){validate(next);if(JSON.stringify(next)===JSON.stringify(this.current))return;this.past.push(structuredClone(this.current));if(this.past.length>100)this.past.shift();this.current=structuredClone(next);this.future=[];}
  undo(){const p=this.past.pop();if(p){this.future.push(structuredClone(this.current));this.current=p;}}
  redo(){const p=this.future.pop();if(p){this.past.push(structuredClone(this.current));this.current=p;}}
  get canUndo(){return this.past.length>0;}get canRedo(){return this.future.length>0;}
}
export function example(kind='studio'):Project {
  const points=kind==='angled'?[[0,0],[6,0],[7,3],[4,5],[0,5]]:[[0,0],[6,0],[6,4],[0,4]];
  return {version:1,name:kind==='angled'?'Angled studio':kind==='curved'?'Curved studio':'Measured studio',nodes:Object.fromEntries(points.map(([x,y],i)=>['n'+i,{x,y}])),walls:points.map((_,i)=>({id:'w'+i,start:'n'+i,end:'n'+((i+1)%points.length),thickness:.18,height:2.7,sweep:kind==='curved'&&i===1?Math.PI/2:0,openings:i===0?[{id:'door',offset:1,width:.9,sill:0,height:2.1}]:i===2?[{id:'window',offset:1.5,width:1.6,sill:.9,height:1.2}]:[]}))};
}
