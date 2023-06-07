import { client } from "../prisma";

export async function GetConnections() {
  let connections = await client.connection.findMany();
  return connections;
}
