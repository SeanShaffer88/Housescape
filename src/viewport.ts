import type {Point} from './geometry';
export type Viewport={center:Point;zoom:number};
export const BASE_SCALE=80;
export function toWorld(v:Viewport,p:Point,width:number,height:number):Point{return {x:v.center.x+(p.x-width/2)/(BASE_SCALE*v.zoom),y:v.center.y-(p.y-height/2)/(BASE_SCALE*v.zoom)};}
export function toScreen(v:Viewport,p:Point,width:number,height:number):Point{return {x:width/2+(p.x-v.center.x)*BASE_SCALE*v.zoom,y:height/2-(p.y-v.center.y)*BASE_SCALE*v.zoom};}
export function zoomAt(v:Viewport,zoom:number,p:Point,width:number,height:number):Viewport {
  const before=toWorld(v,p,width,height),next={center:{...v.center},zoom:Math.max(.1,Math.min(4,zoom))},after=toWorld(next,p,width,height);
  next.center.x+=before.x-after.x;next.center.y+=before.y-after.y;return next;
}
