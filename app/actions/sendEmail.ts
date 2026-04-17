"use server";

import nodemailer from "nodemailer";

export type FormState = { success: boolean; message: string } | null;

export async function sendEmail(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !phone || !email || !message) {
    return { success: false, message: "Por favor, completa todos los campos." };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Camino Legal Web" <${process.env.SMTP_USER}>`,
    to: "info@caminolegal.com.mx",
    replyTo: email,
    subject: `Nuevo contacto: ${name}`,
    html: `
      <h2>Nuevo mensaje desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Tel&eacute;fono:</strong> +52 ${phone}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <hr />
      <p><strong>Mensaje:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });

  return {
    success: true,
    message: "\u00a1Mensaje enviado! En breve nos ponemos en contacto contigo.",
  };
}
