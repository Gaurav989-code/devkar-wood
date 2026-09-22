import ImageKit from "@imagekit/nodejs";
import { env } from "./env.js";

const imagekit = new ImageKit({
  privateKey: env.imagekitPrivateKey,
});

export default imagekit;
