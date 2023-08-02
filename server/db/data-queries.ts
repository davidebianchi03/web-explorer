import { client } from "../prisma";

export async function GetConnections() {
  let connections = await client.connection.findMany();
  return connections;
}

export async function GetConnectionByUuid(uuid: string) {
  let connection = await client.connection.findFirst({
    where: {
      id: uuid,
    },
  });
  return connection;
}

export async function GetConnectionByPath(path: string) {
  let connection = await client.connection.findFirst({
    where: {
      path: path,
    },
  });
  return connection;
}

export async function CreateConnection(name: string, path: string) {
  await client.connection.create({
    data: {
      name:name,
      path:path
    },
  });
}
