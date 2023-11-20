import handlebars from "handlebars"
import fs from "fs"
import path from "path"
import mailer, { TransportOptions } from "nodemailer"

handlebars.registerHelper("eq", (a, b) => a == b)

const mailTransport = mailer.createTransport({
  host: process.env.SMS_HOST,
  port: Number(process.env.SMS_PORT), // Assuming port is a number
  secure: true, // use TLS
  auth: {
    user: process.env.SMS_USER,
    pass: process.env.SMS_PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
} as TransportOptions)

mailTransport.verify(function (error, success) {
  if (error) {
    console.log(error)
  } else {
    console.log("Server is ready to take our messages")
  }
})

export const sendMailNotification = async (
  to_email: string,
  subject: string,
  substitutional_parameters: { [key: string]: string | number },
  Template_Name: string,
  is_save?: any,
) => {
  const source = fs.readFileSync(
    path.join(__dirname, `../templates/${Template_Name}.hbs`),
    "utf8",
  )

  const compiledTemplate = handlebars.compile(source)

  await mailTransport.sendMail({
    from: '"Afrilish" <afrlish_admin@gmail.com>', // sender address
    to: to_email, // list of receivers
    subject: subject, // Subject line
    html: compiledTemplate(substitutional_parameters),
  })
}
