import * as util from 'util';
import * as nconf from 'nconf';
import * as postmark from 'postmark';

let postmarkClient;

if (nconf.get('POSTMARK_API_TOKEN')) {
  postmarkClient = new postmark.Client(nconf.get('POSTMARK_API_TOKEN'));
}

export let emailRegex = {
  validator: function(d) {
    if (!d) return true;
    return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(d) &&
           ((d && d.length || 0) <= 100);
  },
  message: '{VALUE} is not a valid email'
};

export let forgotMailer = function(user, code, cb) {
  const url = nconf.get('PUBLIC_URL') + '#/reset/' + code,
      lines = [
        'Hello,', '',
        'Click <a href="' + url + '">here</a> or go to the link ' +
        'below to reset your password.',
        '', url
      ];

  if (user.email) {
    sendEmail(user.email, { subject: 'Password Reset', lines: lines });
  } else {
    console.info('Forgot code for %s: %s', user.username, code);
  }

  cb();
};

export let verifyEmail = function(user, q, cb) {
  let code = user && user.turnkey && user.turnkey.verification &&
             user.turnkey.verification.code,
      verified = user && user.turnkey && user.turnkey.verification &&
                 user.turnkey.verification.verified,
      url = nconf.get('PUBLIC_URL') + '/turnkey/verify/' + code,
      lines = [
        'Hello,', '',
        'Click <a href="' + url + '">here</a> or go to the link ' +
        'below to verify your account.',
        '', url
      ];

  if (user.email && !verified) {
    sendEmail(
      user.email,
      { subject: 'Account Verification', lines: lines }
    );
  } else if (verified) {
    console.info('Verification turned off.');
  } else {
    console.info('Need to verify user: ', user);
  }

  cb && cb();  // no need to modify response information
};

export let sendEmail = function(to, d = {}, cb?) {
  if (postmarkClient) sendEmailPostmark.apply(this, arguments);
  else {
    console.log('Error: Postmark not configured');
    cb('postmark not configured');
  }
};

export let sendEmailPostmark = function(to, d: any = {}, cb?) {
  d = d || {};
  let appName = 'My Awesome App',
      lines = d.lines || [],
      mailOptions: any = {
        From: nconf.get('FROM_EMAIL'),
        To: to,
        Subject: d.subject || appName
      },
      url = nconf.get('PUBLIC_URL');

  if (!d.hideSignature) {
    lines.push('', 'Thanks,', appName);
    lines.push(util.format('<a href="%s">%s</a>', url, url));
  }

  if (d.cc) mailOptions.CC = d.cc;

  if (d.Attachments) mailOptions.Attachments = d.Attachments;

  if (d.TemplateId) {
    mailOptions.TemplateId = d.TemplateId;
    mailOptions.TemplateModel = d.TemplateModel || {};
    delete mailOptions.Subject;
    postmarkClient.sendEmailWithTemplate(mailOptions, done);
  } else {
    mailOptions.htmlBody = lines.join('<br/>');
    postmarkClient.sendEmail(mailOptions, done);
  }

  function done(e) {
    if (e) {
      console.warn('An error occured emailing. You need to have nconfs for ' +
                  'Postmark. Check those.');
      console.warn('Error: ', e);
      console.info('Message:', lines);
    }
    if (cb) cb.apply(this, arguments);
  }
};

// Middleware ------------------------------------------------------------------

export let mw: any = {};

mw.queryUser = function(isId) {
  return function(d, q, cb) {
    let req = this.request;

    if (!(req && req.user)) return cb('unauthorized');

    // not needed for admins
    if (req.user.role === 'admin') return cb();

    if (isId) {
      if (q._id !== String(req.user._id)) return cb('unauthorized');
    }
    else q.user = String(req.user._id);

    cb();
  };
};

mw.dataUser = function() {
  return function(d, q, cb) {
    let req = this.request;

    if (!(req && req.user)) return cb('unauthorized');

    // if an admin specifies otherwise, it can do things on
    // another user's behalf
    if (req.user.role === 'admin' && d && d.user) return cb();

    d.user = String(req.user._id);
    cb();
  };
};
