export type Unit='imperial'|'metric';
export const FEET_PER_METRE=1/.3048;
export function formatLength(metres:number,unit:Unit):string {
  if(unit==='metric')return `${metres.toFixed(3)} m`;
  const sign=metres<0?'−':'',eighths=Math.round(Math.abs(metres)/.0254*8);
  const feet=Math.floor(eighths/96),inches=Math.floor((eighths%96)/8),part=eighths%8;
  const fractions=['','1/8','1/4','3/8','1/2','5/8','3/4','7/8'];
  return `${sign}${feet}′ ${inches}${part?' '+fractions[part]:''}″`;
}
function number(s:string):number {
  s=s.trim();
  if(!s)return 0;
  if(/^\d+\s+\d+\/\d+$/.test(s)){const [whole,f]=s.split(/\s+/);return Number(whole)+number(f);}
  if(/^\d+\/\d+$/.test(s)){const [a,b]=s.split('/').map(Number);if(!b)throw Error('A fraction cannot divide by zero.');return a/b;}
  if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))throw Error('Enter a decimal or a fraction.');
  return Number(s);
}
export function parseLength(input:string,unit:Unit):number {
  let s=input.trim().toLowerCase().replace(/−/g,'-').replace(/[½¼¾⅛⅜⅝⅞]/g,c=>' '+({'½':'1/2','¼':'1/4','¾':'3/4','⅛':'1/8','⅜':'3/8','⅝':'5/8','⅞':'7/8'}[c]!));
  if(!s)throw Error('Enter a length.');
  const sign=s.startsWith('-')?-1:1;s=s.replace(/^[+-]/,'');
  if(unit==='metric'){
    const match=s.match(/^(.*?)(mm|cm|m)?$/)!;
    return sign*number(match[1])*(match[2]==='mm'?.001:match[2]==='cm'?.01:1);
  }
  s=s.replace(/feet|foot|ft|′/g,"'").replace(/inches|inch|in|″|”/g,'"');
  if(s.includes("'")){
    const match=s.match(/^([^']+)'\s*([^'"]*)"?$/);if(!match)throw Error('Use feet and inches, for example 12′ 6½″ (type 12\' 6 1/2").');
    return sign*(number(match[1])*12+number(match[2]))*.0254;
  }
  if(s.endsWith('"'))return sign*number(s.slice(0,-1))*.0254;
  return sign*number(s)*.3048;
}
export function formatArea(m2:number,unit:Unit){return `${(unit==='imperial'?m2*FEET_PER_METRE**2:m2).toFixed(2)} ${unit==='imperial'?'ft²':'m²'}`;}
