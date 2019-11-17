
const { exec } = require('child_process');
const fs = require('fs');
const sudo = require('sudo-prompt');


let awsQuery = "aws ec2 describe-instances --query \"Reservations[*].Instances[*].{PublicIpAddress:PublicIpAddress,Name:Tags[?Key=='Name']|[0].Value}\" --output=json";

sudo.exec(awsQuery, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  const hostsFile = '/etc/hosts';
  fs.exists(hostsFile, function() {
    console.log("Writing AWS hosts to " + hostsFile + "...");

    let outputFile = fs.createWriteStream(hostsFile);
    let jsonOutput = JSON.parse(stdout);
    //write local loopback
    outputFile.write('::1             localhost\n');

    jsonOutput.forEach(function(ec2Instance) {
      if (ec2Instance[0].PublicIpAddress !== null) {
        let output = ec2Instance[0].PublicIpAddress + " "+  ec2Instance[0].Name + ".vagrant\n"

        outputFile.write(output);
        console.log(output);
      }
    });
  });
});