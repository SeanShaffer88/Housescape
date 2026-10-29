import {validate,type Project} from './geometry';

export interface FileApi {
  chooseOpen():Promise<string|null>;
  chooseSave():Promise<string|null>;
  size(path:string):Promise<number>;
  read(path:string):Promise<string>;
  write(path:string,text:string):Promise<void>;
}
/** No success is returned until the native filesystem confirms the write. */
export function projectFiles(api:FileApi){return {
  async save(project:Project){
    validate(project);
    const text=JSON.stringify(project,null,2);
    const path=await api.chooseSave();if(!path)return null;
    await api.write(path,text);return path;
  },
  async open(){
    const path=await api.chooseOpen();if(!path)return null;
    if(await api.size(path)>1_000_000)throw Error('Prototype project files must be smaller than 1 MB.');
    const project=JSON.parse(await api.read(path));validate(project);
    return project as Project;
  }
};}
export async function nativeProjectFiles(){
  const dialog=await import('@tauri-apps/plugin-dialog'),fs=await import('@tauri-apps/plugin-fs');
  return projectFiles({
    chooseOpen:()=>dialog.open({title:'Open Housescape project',multiple:false,directory:false,filters:[{name:'Housescape project',extensions:['housescape','json']}]}),
    chooseSave:()=>dialog.save({title:'Save Housescape project',defaultPath:'studio.housescape',filters:[{name:'Housescape project',extensions:['housescape']}]}),
    size:async path=>(await fs.stat(path)).size,
    read:fs.readTextFile,
    write:fs.writeTextFile
  });
}
