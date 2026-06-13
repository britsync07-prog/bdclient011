const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Force DNS lookup to resolve IPv4 addresses only
const originalLookup = dns.lookup;
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let dnsOpts = {};
  if (typeof options === 'number') {
    dnsOpts = { family: options };
  } else if (options) {
    dnsOpts = { ...options };
  }
  dnsOpts.family = 4;
  return originalLookup(hostname, dnsOpts, callback);
};

const originalPromisesLookup = dns.promises ? dns.promises.lookup : null;
if (dns.promises && typeof dns.promises.lookup === 'function') {
  dns.promises.lookup = function(hostname, options) {
    let dnsOpts = {};
    if (typeof options === 'number') {
      dnsOpts = { family: options };
    } else if (options) {
      dnsOpts = { ...options };
    }
    dnsOpts.family = 4;
    return originalPromisesLookup.call(dns.promises, hostname, dnsOpts);
  };
}

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
