import { client } from "../prisma";

export async function GetConnections() {
  let connections = await client.connection.findMany();
  return connections;
}

export async function GetConnection(uuid: string) {
  let connection = await client.connection.findFirst({
    where: {
      id: uuid,
    },
  });
  return connection;
}
