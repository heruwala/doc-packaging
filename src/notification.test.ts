import { SendEmail } from "./notification";

describe('Notification', () => {

    //const key = process.env['SENDGRID_API_KEY']!;
    const msg = {
        to: 'dheruwala@ecfmg.org',
        from: 'dheruwala@intealth.org', // Use the email address or domain you verified above
        subject: 'Sending with Twilio SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };

    it('should be defined', () => {
        // call SendEmail function passing msg as argument
        expect(SendEmail(msg)).toBeDefined();
        //make the above call async
        //expect(SendEmail(msg)).resolves.toBeDefined();
    });
});