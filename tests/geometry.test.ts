import {describe,it,expect} from 'vitest';
import {example,wallLength,roomArea,setLength,History,validate,pointAt,wallFootprint,wallBands,boundary} from '../src/geometry';
describe('measured room',()=>{
  it('computes rectangle area and perimeter',()=>{const p=example();expect(roomArea(p)).toBe(24);expect(p.walls.reduce((s,w)=>s+wallLength(p,w),0)).toBe(20);});
  it('preserves shared joins during dimension edits',()=>{const p=setLength(example(),'w0',8);expect(p.nodes.n1.x).toBe(8);expect(p.walls[0].end).toBe(p.walls[1].start);expect(wallLength(p,p.walls[0])).toBe(8);expect(roomArea(p)).toBe(28);});
  it('supports an angled room without invalid wall footprints',()=>{const p=example('angled');validate(p);for(const w of p.walls)expect(wallFootprint(p,w).every(v=>Number.isFinite(v.x+v.y))).toBe(true);});
  it('mitres the shared inner and outer rectangle corners',()=>{const p=example(),a=wallFootprint(p,p.walls[0]),b=wallFootprint(p,p.walls[1]);expect(a[1].x).toBeCloseTo(b[0].x);expect(a[1].y).toBeCloseTo(b[0].y);expect(a[2].x).toBeCloseTo(b[3].x);expect(a[2].y).toBeCloseTo(b[3].y);});
  it('rejects crossing boundaries',()=>{const p=example();p.walls.forEach(w=>w.openings=[]);p.nodes.n1={x:6,y:4};p.nodes.n2={x:6,y:0};expect(()=>validate(p)).toThrow();});
  it('rejects nonfinite, zero length, disconnected and duplicate walls',()=>{const mutations:((p:ReturnType<typeof example>)=>unknown)[]=[p=>p.nodes.n1.x=NaN,p=>p.nodes.n1={...p.nodes.n0},p=>p.walls[0].end='n2',p=>p.walls[1].id='w0'];for(const mutate of mutations){const p=example();mutate(p);expect(()=>validate(p)).toThrow();}});
  it('rejects invalid import schemas',()=>{for(const p of [null,{}, {version:2}, {...example(),walls:[]}])expect(()=>validate(p as ReturnType<typeof example>)).toThrow();});
});
describe('curves',()=>{
  it('uses exact circular segment area, not tessellated area',()=>{const p=example('curved'),s=Math.PI/2,r=4/(2*Math.sin(s/2));expect(wallLength(p,p.walls[1])).toBeCloseTo(r*s,10);expect(roomArea(p)).toBeCloseTo(24+r*r*(s-Math.sin(s))/2,10);expect(pointAt(p,p.walls[1],0)).toEqual(expect.objectContaining({x:expect.closeTo(6),y:expect.closeTo(0)}));expect(pointAt(p,p.walls[1],1).y).toBeCloseTo(4);});
  it('handles negative sweep and almost-straight walls',()=>{const p=example('curved');p.walls[1].sweep=-Math.PI/2;validate(p);expect(roomArea(p)).toBeLessThan(24);p.walls[1].sweep=1e-10;expect(roomArea(p)).toBeCloseTo(24);});
  it('sets arc length while retaining its sweep and connection',()=>{const p=setLength(example('curved'),'w1',5);expect(wallLength(p,p.walls[1])).toBeCloseTo(5,10);expect(p.walls[1].sweep).toBe(Math.PI/2);});
  it('tessellates curves for rendering only',()=>{expect(boundary(example('curved')).length).toBeGreaterThan(50);});
});
describe('openings',()=>{
  it('leaves door volume empty but retains the lintel',()=>{const p=example(),bands=wallBands(p,p.walls[0]);expect(bands).toHaveLength(3);expect(bands[1].bottom).toBe(2.1);const volume=bands.reduce((v,b)=>v+(b.t1-b.t0)*6*.18*(b.top-b.bottom),0);expect(volume).toBeCloseTo(6*.18*2.7-.9*.18*2.1);});
  it('retains the wall below a window',()=>{const p=example(),b=wallBands(p,p.walls[2]);expect(b.some(b=>b.bottom===0&&b.top===.9)).toBe(true);});
  it('rejects overlapping, oversized, negative and nonfinite openings',()=>{for(const update of [{offset:5.5},{width:0},{sill:-1},{height:4},{offset:NaN}]){const p=example();Object.assign(p.walls[0].openings[0],update);expect(()=>validate(p)).toThrow();}const p=example();p.walls[0].openings.push({...p.walls[0].openings[0],id:'other'});expect(()=>validate(p)).toThrow();});
  it('rejects a dimension edit which would orphan an opening',()=>expect(()=>setLength(example(),'w0',1)).toThrow());
});
describe('history and files',()=>{
  it('round trips all project geometry without drift',()=>{const p=example('curved'),q=JSON.parse(JSON.stringify(p));validate(q);expect(q).toEqual(p);expect(roomArea(q)).toBe(roomArea(p));});
  it('undoes and redoes 40 edits without accumulating drift',()=>{const h=new History(example());for(let i=0;i<40;i++)h.commit(setLength(h.current,'w0',6+(i+1)*.01));for(let i=0;i<40;i++)h.undo();expect(h.current).toEqual(example());for(let i=0;i<40;i++)h.redo();expect(wallLength(h.current,h.current.walls[0])).toBeCloseTo(6.4,10);});
  it('discards redo after branching and isolates caller mutations',()=>{const h=new History(example());h.commit(setLength(h.current,'w0',7));h.undo();const next=setLength(h.current,'w0',8);h.commit(next);next.nodes.n1.x=100;expect(h.canRedo).toBe(false);expect(h.current.nodes.n1.x).toBe(8);});
  it('keeps the previous project after rejected edits',()=>{const h=new History(example()),bad=example();bad.nodes.n1.x=Infinity;expect(()=>h.commit(bad)).toThrow();expect(h.current).toEqual(example());expect(h.canUndo).toBe(false);});
});
