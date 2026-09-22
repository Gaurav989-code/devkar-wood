import jwt from "jsonwebtoken";
import { env } from "../configs/env.js";

const generateAdminToken = (adminId) => {
  return jwt.sign(
    {
      adminId,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpire,
      algorithm: "HS256",
      issuer: "devkar-wood-api",
      audience: "devkar-wood-admin",
    }
  );
};

export default generateAdminToken;