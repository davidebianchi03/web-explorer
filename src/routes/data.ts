import { Router } from "express";
import prisma from "../prisma";
import { ConnectionType } from "@prisma/client";
import * as local_handler from "../file-sources/local";

export const router = Router();

router.get("/root/:id", async (req, res) => {
  let connection_id = req.params.id;
  let connection = await prisma.connection.findFirst({
    where: {
      id: connection_id,
    },
  });
  if (connection) {
    if (connection.connection_type == ConnectionType.LOCAL) {
      var root = local_handler.GetRoot();
      res.status(200).send({
        root: root,
      });
    } else {
      res.status(400).send({
        error: "Connection type not allowed",
      });
    }
  } else {
    res.status(400).send({
      error: "Connection doesn't exist",
    });
  }
});

router.get("/children/:id/:path", async (req, res) => {
  let connection_id = req.params.id;
  let connection = await prisma.connection.findFirst({
    where: {
      id: connection_id,
    },
  });
  if (connection) {
    if (connection.connection_type == ConnectionType.LOCAL) {
      if (local_handler.Exists(req.params.path)) {
        res.status(200).send(await local_handler.GetChildren(req.params.path));
      } else {
        res.status(404).send({
          error: "Not found",
        });
      }
    } else {
      res.status(400).send({
        error: "Connection type not allowed",
      });
    }
  } else {
    res.status(400).send({
      error: "Connection doesn't exist",
    });
  }
});

router.get("/download/:id/:path", async (req, res) => {
  let connection_id = req.params.id;
  let connection = await prisma.connection.findFirst({
    where: {
      id: connection_id,
    },
  });
  if (connection) {
    if (connection.connection_type == ConnectionType.LOCAL) {
      console.log(req.params.path);
      if (local_handler.Exists(req.params.path)) {
        if (!local_handler.isDirectory(req.params.path)) {
          // download file
          local_handler.DownloadFile(req.params.path, req, res);
        } else {
          res.status(400).send({
            error: "Cannot download directory",
          });
        }
      } else {
        res.status(404).send({
          error: "Not found",
        });
      }
    } else {
      res.status(400).send({
        error: "Connection type not allowed",
      });
    }
  } else {
    res.status(400).send({
      error: "Connection doesn't exist",
    });
  }
});
