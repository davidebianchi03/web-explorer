import { CreateConnection, GetConnectionByPath } from "./db/data-queries";

export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
}

export function LoadConnectionsFromEnvironment(){
   // get connections from environment variables
   if(process.env.CONNECTIONS){
     let env_connections = process.env.CONNECTIONS.split(';');
     env_connections.forEach(async(connection_path) => {
      connection_path = connection_path.trim();
       let connection_obj = await GetConnectionByPath(connection_path);
       if(!connection_obj){
         CreateConnection(connection_path, connection_path);
       }
     });
   }
}
