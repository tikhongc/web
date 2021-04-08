//file for sending email to user
//using send grid to send email //https://app.sendgrid.com/guide

const Mail = require('@sendgrid/mail');
const APIkey='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';
Mail.setApiKey(APIkey);

// types of email 

//welcome email
//user reovery email
//notification email ?

const WelcomeEmail = (email, name) => {
    Mail.send({
        to: email,
        from: '1205542199@qq.com',
        subject: 'Thanks for joining in Cuery community!',
        text: `Welcome to the Cuery, ${name}. +introduction`,
        html: '<strong>and easy to do anywhere, even with Node.js</strong>'
    }).then(() => {
        console.log('WelcomeEmail sent')
      })
      .catch((error) => {
        console.error(error)
      })
}

const RecoveryEmail = (email, name) => {
    Mail.send({
        to: email,
        from: '1205542199@qq.com',
        subject: 'Please reset your password',
        text: ` `
    }).then(() => {
        console.log('RecoveryEmail sent')
      })
      .catch((error) => {
        console.error(error)
      })
}


module.exports = {
    WelcomeEmail,
    RecoveryEmail
}



