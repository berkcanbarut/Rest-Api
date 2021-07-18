const sgMail = require('@sendgrid/mail')

const sendGridMail = (msg) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    return sgMail.send(msg)
      .then(()=>{
          return true;
      })
      .catch((err)=>{
          console.log(err);
          return false
      })
}
module.exports = sendGridMail;