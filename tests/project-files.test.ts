import {describe,it,expect,vi} from 'vitest';
import {example} from '../src/geometry';
import {projectFiles,type FileApi} from '../src/project-files';
function api():FileApi{return {chooseOpen:vi.fn(async()=>'/test/room.housescape'),chooseSave:vi.fn(async()=>'/test/room.housescape'),size:vi.fn(async()=>100),read:vi.fn(async()=>JSON.stringify(example())),write:vi.fn(async()=>{})};}
describe('native project file workflow',()=>{
  it('does not write when Save is cancelled',async()=>{const io=api();io.chooseSave=async()=>null;expect(await projectFiles(io).save(example())).toBeNull();expect(io.write).not.toHaveBeenCalled();});
  it('does not read when Open is cancelled',async()=>{const io=api();io.chooseOpen=async()=>null;expect(await projectFiles(io).open()).toBeNull();expect(io.read).not.toHaveBeenCalled();});
  it('propagates a failed write instead of reporting success',async()=>{const io=api();io.write=async()=>{throw Error('Disk full');};await expect(projectFiles(io).save(example())).rejects.toThrow('Disk full');});
  it('waits for the actual write to finish',async()=>{const io=api();let finish!:()=>void;io.write=()=>new Promise<void>(resolve=>finish=resolve);let saved=false;const promise=projectFiles(io).save(example()).then(()=>saved=true);await vi.waitFor(()=>expect(finish).toBeTypeOf('function'));expect(saved).toBe(false);finish();await promise;expect(saved).toBe(true);});
  it('captures a snapshot before a slow save dialog returns',async()=>{const io=api(),p=example();io.chooseSave=async()=>{p.name='Changed later';return '/test/room.housescape';};await projectFiles(io).save(p);expect(JSON.parse(vi.mocked(io.write).mock.calls[0][1]).name).toBe('Measured studio');});
  it('rejects oversized files before reading their contents',async()=>{const io=api();io.size=async()=>1_000_001;await expect(projectFiles(io).open()).rejects.toThrow('smaller than 1 MB');expect(io.read).not.toHaveBeenCalled();});
  it('rejects malformed or invalid project data',async()=>{for(const text of ['{','{}',JSON.stringify({...example(),version:2})]){const io=api();io.read=async()=>text;await expect(projectFiles(io).open()).rejects.toThrow();}});
  it('preserves geometry through a save/open round trip',async()=>{const io=api();let text='';io.write=async(_,data)=>{text=data;};io.read=async()=>text;const files=projectFiles(io),p=example('curved');await files.save(p);expect(await files.open()).toEqual(p);});
});
