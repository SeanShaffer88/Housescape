import {validate,type Project,type Point} from './geometry';
/** Rebuilds the one-room boundary; room graphs and partitions are a later gate. */
export function roomFromPoints(points:Point[],previous:Project):Project {
  if(points.length<3)throw Error('A room needs at least three corners.');
  const pts=structuredClone(points);
  const area=pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p.x*q.y-p.y*q.x;},0);
  if(area<0)pts.reverse();
  const p:Project={version:1,name:previous.name,floorColor:previous.floorColor,north:previous.north,nodes:Object.fromEntries(pts.map((p,i)=>[`n${i}`,p])),walls:pts.map((_,i)=>({id:`w${i}`,start:`n${i}`,end:`n${(i+1)%pts.length}`,thickness:previous.walls[0].thickness,height:previous.walls[0].height,sweep:0,openings:[]}))};
  validate(p);return p;
}
export function rectangle(a:Point,b:Point,previous:Project){return roomFromPoints([{x:a.x,y:a.y},{x:b.x,y:a.y},{x:b.x,y:b.y},{x:a.x,y:b.y}],previous);}
