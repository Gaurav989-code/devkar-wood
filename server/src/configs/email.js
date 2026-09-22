import nodemailer from "nodemailer";

import { env } from "./env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: env.email,
    pass: env.emailPassword,
  },
});

export const verifyEmailConnection = async () => {
  await transporter.verify();

  console.log("Email server connected successfully");
};

export default transporter;
