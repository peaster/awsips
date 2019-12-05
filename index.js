const { exec } = require("child_process");
const fs = require('fs');

module.exports = () => {
  let awsQuery = "aws ec2 describe-instances --query \"Reservations[*].Instances[*].{PublicIpAddress:PublicIpAddress,Name:Tags[?Key=='Name']|[0].Value}\" --output=json";

  exec(awsQuery, {name: 'AWS Host Update Task'}, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    const hostsFile = '/etc/hosts';
    console.log("Writing AWS hosts to " + hostsFile + "...\n");

    fs.exists(hostsFile, function() {

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
      console.log("IPs successfully written!")
    });
  });
}
