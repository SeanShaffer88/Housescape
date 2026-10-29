import {describe,it,expect} from 'vitest';
import {formatLength,parseLength,formatArea} from '../src/units';
import {toWorld,toScreen,zoomAt} from '../src/viewport';
import {roomFromPoints,rectangle} from '../src/drawing';
import {example,roomArea,History,validate,type Project} from '../src/geometry';
describe('editor units',()=>{
  it('formats carried feet, inch fractions, zero and negative coordinates',()=>{expect(formatLength(.3048,'imperial')).toBe('1′ 0″');expect(formatLength(.0254*11.99,'imperial')).toBe('1′ 0″');expect(formatLength(.0254*1.5,'imperial')).toBe('0′ 1 1/2″');expect(formatLength(-.3048,'imperial')).toBe('−1′ 0″');});
  it('parses feet/inches and fractions independently of display rounding',()=>{expect(parseLength('12\' 6 1/2"','imperial')).toBeCloseTo(3.8227,10);expect(parseLength('18"','imperial')).toBeCloseTo(.4572);expect(parseLength('6.5','imperial')).toBeCloseTo(1.9812);expect(parseLength('2 ft 3 in','imperial')).toBeCloseTo(.6858);});
  it('handles metric suffixes and rejects invalid input',()=>{expect(parseLength('180 mm','metric')).toBe(.18);expect(parseLength('35cm','metric')).toBeCloseTo(.35);for(const s of ['NaN','Infinity','1/0','3 things',''])expect(()=>parseLength(s,'metric')).toThrow();});
  it('round trips imperial display within half an eighth inch',()=>{for(const n of [-4.31,0,.18,2.7,6,25.123])expect(Math.abs(parseLength(formatLength(n,'imperial'),'imperial')-n)).toBeLessThanOrEqual(.0254/16+.000001);expect(formatArea(.3048**2,'imperial')).toBe('1.00 ft²');});
  it('accepts typographic fractions copied from plans',()=>expect(parseLength('6′ 6½″','imperial')).toBeCloseTo(1.9939));
});
describe('viewport',()=>{
  it('maps screen and world coordinates reversibly',()=>{const v={center:{x:3,y:2},zoom:.75},p={x:5.3,y:-1.7};const result=toWorld(v,toScreen(v,p,900,700),900,700);expect(result.x).toBeCloseTo(p.x);expect(result.y).toBeCloseTo(p.y);});
  it('keeps the cursor anchor fixed while zooming',()=>{const v={center:{x:3,y:2},zoom:1},p={x:100,y:190},before=toWorld(v,p,900,700),after=toWorld(zoomAt(v,2,p,900,700),p,900,700);expect(after).toEqual(before);expect(zoomAt(v,100,p,900,700).zoom).toBe(4);});
});
describe('single-room drawing',()=>{
  it('creates valid rectangles in all drag directions',()=>{for(const b of [{x:6,y:4},{x:-6,y:4},{x:6,y:-4},{x:-6,y:-4}]){const p=rectangle({x:0,y:0},b,example());expect(roomArea(p)).toBe(24);expect(p.walls).toHaveLength(4);}});
  it('closes a polygon with shared endpoint IDs and validates it',()=>{const p=roomFromPoints([{x:0,y:0},{x:5,y:0},{x:4,y:3}],example());expect(p.walls.at(-1)!.end).toBe(p.walls[0].start);expect(roomArea(p)).toBe(7.5);});
  it('rejects tiny, incomplete and crossing boundaries',()=>{expect(()=>rectangle({x:0,y:0},{x:.01,y:.01},example())).toThrow();expect(()=>roomFromPoints([{x:0,y:0}],example())).toThrow();expect(()=>roomFromPoints([{x:0,y:0},{x:4,y:4},{x:4,y:0},{x:0,y:4}],example())).toThrow();});
});
describe('editor metadata',()=>{
 it('preserves notes, dimensions, finishes and north through history/files',()=>{const p=example();p.notes=[{id:'note',point:{x:1,y:1},text:'<script>literal text</script>'}];p.dimensions=[{id:'d',a:{x:0,y:0},b:{x:1,y:0}}];p.floorColor='#d8c8ad';p.north=45;const h=new History(example());h.commit(p);h.undo();h.redo();expect(JSON.parse(JSON.stringify(h.current))).toEqual(p);});
 it('rejects malformed note positions, colors and dimension endpoints',()=>{for(const change of [(p:Project)=>p.floorColor='url(bad)',(p:Project)=>p.north=NaN,(p:Project)=>p.notes=[{id:'n',point:{x:Infinity,y:0},text:'bad'}],(p:Project)=>p.dimensions=[{id:'d',a:{x:0,y:0},b:{x:0,y:0}}]]){const p=example();change(p);expect(()=>validate(p)).toThrow();}});
});
