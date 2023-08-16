//const sgMail = require('@sendgrid/mail');
import sgMail from '@sendgrid/mail';


export const SendEmail = async (msg: any) => {
    //const key = process.env['SENDGRID_API_KEY']!;
    //console.log('key:', key);
    sgMail.setApiKey('');

  await sgMail
  .send(msg)
  .then(() => { console.log('Email sent'); }, (error: any) => {
    console.error(error);

    if (error.response) {
      console.error(error.response.body)
    }
  });
}   