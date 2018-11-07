# iot-fire-detector
<img src="https://github.com/hcl-pnp-rtist/iot-fire-detector/blob/master/webapp/public/img/flame.jpg" width="40" height="40">

A fire detector IoT application implemented in [HCL RTist](https://www.devops-community.com/realtime-software-tooling-rtist.html). The application is intended to be deployed on a hardware device (such as Raspberry Pi) which has at least two connected temperature sensors. The application communicates with the Google IoT cloud service over MQTT. This example shows both incoming and outgoing communication. 
For incoming messages the application subscribes to the /devices/\<device-id\>/config MQTT topic. Incoming messages are expected to be JSON encoded, and can be used for suspending or resuming one of the connected temperature sensors. For example, to suspend the first sensor send this JSON message:
{ "command" : "suspendSensor", "id" : 0}
You can send these configuration messages using the Update Config command in the Google IoT web application (on the Device page).

Outgoing messages are also JSON encoded using the RTJsonEncoding class from the TargetRTS. These MQTT messages are published on the /devices/\<device-id\>/events MQTT topic. 

## Setting up Google IoT
Before you can run this application you must set-up a Google IoT account. The names used in the steps below are what the application expects by default, but you can use any names as long as you update the source code accordingly.
* Create a project with the name "RSARTE-IoT" (so it gets the id "rsarte-iot").
* Create a device registry "RTist_device_registry". Specify an appropriate region that is close to your geographical position. Make sure the MQTT protocol is enabled.
* Create default Pub/Sub topics for the device registry. The default telemetry topic should be called "DemoTopic" so its full name becomes "projects/rsarte-iot/topics/DemoTopic". The default device state topic should be called "DeviceTopic" so its full name becomes "projects/rsarte-iot/topics/DeviceTopic".
* Go to the Pub/Sub web page in Google Cloud Platform and create a subscription for the DemoTopic. It should be called "web-sub" so its full name becomes "projects/rsarte-iot/subscriptions/web-sub". The web application uses this subscription to fetch MQTT messages sent by the application.
* Go back to the device registry page in the IoT Core web page in Google Could Platform. Create a device with the id "rtist_demo_device".
* Go to the web page for editing the device you just created. Upload a public key for the device. It is recommended to use a key on the format ES256_X509. Follow the instructions on [this page](https://cloud.google.com/iot/docs/how-tos/credentials/keys) to generate the public key and its corresponding private key. The IoT application will use the private key for authenticating with Google IoT so keep it safe.
* Go to the Service Account page under IAM & admin in Google Cloud Platform. Create a service account for the project "RSARTE-IoT". Generate a key for the service account and download it (a JSON file). The web application will use this key to authenticate with Google IoT so keep it safe.
