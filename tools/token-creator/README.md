# TokenCreator

This tool helps with the creation of valid JSON Web Tokens for [dynamic log level setting](https://github.com/SAP/cf-nodejs-logging-support#dynamic-log-levels) feature. 

## Install
Switch to the token-creator folder and execute
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

### Note:
Currently it is neccessary to create a keypair (public and private key) yourself and provide the private key via the ```--key``` or ```--keyfile``` option. 
