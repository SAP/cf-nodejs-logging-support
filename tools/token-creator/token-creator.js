var program = require('commander');
var jwt = require('jsonwebtoken');
var fs = require('fs');

const levels = [
    "error", "warn", "info", "verbose", "debug", "silly"
];

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/g;


program
    .arguments('<level>')
    .option('-k, --key <private-key>', 'a private key to sign token with')
    .option('-f, --keyfile <private-key-file>', 'a path to a file containing the private key')
    .option('-v, --validityPeriod <days>', 'number of days the token will expire after')
    .option('-i, --issuer <email-address>', 'valid issuer e-mail address')
    .action(function (level) {
        var period = 2; // default period 2 days
        var key = null;
        var exp = null;
        var issuer = "firstname.lastname@sap.com";

        console.log("\n=== TOKEN CREATOR ===\n");

        if (!validateLevel(level)) {
            console.error("Error: Provided level is not valid. Please use \033[3merror, warn, info, verbose, debug or silly\033[0m");
            return;
        }

        if (program.key != undefined && program.keyfile != undefined) {
            console.error("Error: Please provide either the --key option OR the --keyfile option.");
            return;
        }

        if (program.keyfile != undefined) {
            try {
                key = fs.readFileSync(program.keyfile);
                console.log("Using private key from keyfile (" + program.keyfile + ").\n");
            } catch (err) {
                console.error(err);
                return;
            }
        } else if (program.key != undefined) {
            key = "-----BEGIN RSA PRIVATE KEY-----\n" + program.key + "\n-----END RSA PRIVATE KEY-----";
            console.log("Using private key from --key option.\n");
        } else {
            // Nice to have: KeyPair generation
            console.log("Error: Generating keypairs on-the-fly is currently not supported by this script. Please provide a private key by using the --key or --keyfile option.");
            return;
        }

        if (program.validityPeriod != undefined) {
            if (validatePeriod(program.validityPeriod)) {
                period = program.validityPeriod;
            } else {
                console.error("Error: Validity period is invalid. Must be a number >= 1.");
                return;
            }
        }

        exp = Math.floor(Date.now() / 1000) + period * 86400; // calculate expiration timestamp

        if (program.issuer != undefined) {
            if (validateEmail(program.issuer)) {
                issuer = program.issuer;
            } else {
                console.error("Error: The provided issuer e-mail address is invalid.");
                return;
            }
        }


        console.log("LOGGING LEVEL: " + level);
        console.log("ISSUER: " + issuer);
        console.log("EXPIRATION DATE: " + exp + " (" + (new Date(exp * 1000).toLocaleString()) + ")");

        var token = createToken(level, key, exp, issuer);
        if (token == null) {
            console.log("\nError: Failed to create token. Please check key/keyfile and provided options.");
            return;
        }

        console.log("\nTOKEN: \n" + token);
    })
    .parse(process.argv);

if (program.args.length === 0) program.help();

function validateLevel(level) {
    return levels.includes(level);
}

function validatePeriod(days) {
   if (!isNaN(days)) {
       return (days >= 1);
   } else {
        return null;
   }
}

function validateEmail(address) {
    return emailRegex.test(address);
}

function createToken(level, key, exp, issuer) {
    try {
        return jwt.sign({ level: level, exp: exp, issuer: issuer }, key, { algorithm: 'RS256'});
    } catch (err) {
        console.error(err);
        return null;
    }
}