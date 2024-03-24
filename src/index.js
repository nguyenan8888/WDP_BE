"use strict";

import { server } from "./app";
import { connection } from "./database/mongo.database";

const PORT = process.env.SERVER_PORT;
const HOST = process.env.SERVER_HOST;

(async () => {
  try {
    await connection();

    server.listen(PORT, HOST, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err.message);
  }
})();
