# Token Creator

This tool helps with the creation of valid Json-Webtokens for dynamic log level setting feature. 

## Install
Switch to the Toke.Creator folder and execute
```sh
npm install
```

## Usage

### Basic usage
```node token-creator [options] <level>```

### Options:
Available command-line options:
```sh
-k, --key <private-key>             a private key to sign token with
-f, --keyfile <private-key-file>    a path to a file containing the private key
-v, --validityPeriod <days>         number of days the token will expire after
-i, --issuer <email-address>        valid issuer e-mail address
-h, --help                          output usage information
```
