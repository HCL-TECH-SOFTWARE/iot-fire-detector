# iot-fire-detector
<img src="https://github.com/hcl-pnp-rtist/iot-fire-detector/blob/master/webapp/public/img/flame.jpg" width="40" height="40">

A fire detector IoT application implemented in [HCL RTist](https://www.devops-community.com/realtime-software-tooling-rtist.html). The application is intended to be deployed on a hardware device (such as Raspberry Pi) which has at least two connected temperature sensors. The application communicates with the Google IoT cloud service over MQTT. This example shows both incoming and outgoing communication. 
For incoming messages the application subscribes to the /devices/\<device-id\>/config MQTT topic. Incoming messages are expected to be JSON encoded, and can be used for suspending or resuming one of the connected temperature sensors. For example, to suspend the first sensor send this JSON message:
{ "command" : "suspendSensor", "id" : 0}
You can send these configuration messages using the Update Config command in the Google IoT web application (on the Device page).

Outgoing messages are also JSON encoded using the RTJsonEncoding class from the TargetRTS. These MQTT messages are published on the /devices/\<device-id\>/events MQTT topic. 
