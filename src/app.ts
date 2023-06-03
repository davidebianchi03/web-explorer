import { createServer } from "./server";

async function main() {
  let app = await createServer();
  const port = 3000;

  app.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`);
  });
}

main();