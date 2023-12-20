# iot-fire-detector
<img src="https://github.com/hcl-pnp-rtist/iot-fire-detector/blob/master/webapp/public/img/flame.jpg" width="40" height="40">

A fire detector IoT application implemented in [Model RealTime](https://www.hcl-software.com/devops-model-realtime). The application is intended to be deployed on a Raspberry Pi which has at least two connected temperature sensors. The application communicates with the Google IoT cloud service over MQTT. This example shows both incoming and outgoing communication. 
For incoming messages the application subscribes to the /devices/\<device-id\>/config MQTT topic. Incoming messages are expected to be JSON encoded, and can be used for suspending or resuming one of the connected temperature sensors. For example, to suspend the first sensor send this JSON message:
{ "command" : "suspendSensor", "id" : 0}.
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
* Go to the Service Account page under IAM & admin in Google Cloud Platform. Create a service account "webapp-account" for the project "RSARTE-IoT". Create a key for the service account and download it (a JSON file). The web application will use this key to authenticate with Google IoT so keep it safe.

## Building the application for Raspberry Pi
The TC "pi_app" is configured for building the application on Windows using the cross-compilation toolchain for Raspberry Pi. 
* Install the toolchain according to the instructions on [this page](http://gnutoolchains.com/raspberry/).
* Restart Model RealTime and make sure the toolchain is shown in preferences at *C/C++ - Core Build Toolchains*. You should see a GCC toolchain for the "linux" OS and "arm" architecture.
* The TC references a TargetRTS configuration for the Raspberry Pi called "RPI9T.ARM-g++-4.9.2". You need to build this TargetRTS configuration. Place it in a folder which you then reference from the "Target services library" in the TC. The TC assumes this folder is D:\\rsarte\\TargetRTS\\Raspberry-TargetRTS\\TargetRTS.
* The application uses a few C++ libraries for communicating with Google IoT. It is easiest to build these libraries on the Raspberry Pi and then copy them from /usr/local/lib on the Raspberry Pi to your toolchain installation (for example D:\\SysGCC\\Raspberry\\arm-linux-gnueabihf\\sysroot\\usr\\lib\\arm-linux-gnueabihf). To build the libraries perform the following commands on the Raspberry Pi:

```
git clone https://github.com/akheron/jansson
cd jansson && cmake . && make && make install
git clone https://github.com/openssl/openssl
cd openssl && ./config && make && make install
git clone https://github.com/benmcollins/libjwt
cd libjwt && autoreconf -i && ./configure && make && make install
git clone https://github.com/eclipse/paho.mqtt.c.git
cd paho.mqtt.c && cmake -DPAHO_WITH_SSL=TRUE -DPAHO_BUILD_DOCUMENTATION=TRUE -DPAHO_BUILD_SAMPLES=TRUE . && make all && make install
```

* You also need to copy the header files that correspond to the built libraries. Copy them from their respective directory on the Raspberry Pi into similar directories on your local machine. The inclusion paths in the TC assume they are placed in the following directories: D:\\jansson\include, D:\\libjwt\\include, D:\\openssl\\include, D:\\eclipse\\paho-mqtt\\src
* Now you should be able to build the TC locally on your Windows machine, and it should generate an executable in the target directory which is built for the Raspberry Pi.

## Deploying and starting the application on the Raspberry Pi
You can just copy the built executable from your Windows machine to the Raspberry Pi and then start it as usual. However, it is more convenient to install the Remote Systems plugin in Eclipse to automate this step so that the executable is automatically copied to the Raspberry Pi each time you run or debug it from Eclipse. Install the Remote Systems plugin from the Eclipse update site that corresponds to your version of Model RealTime (for example, for Model RealTime 10.3 you should use the update site for Eclipse Photon: http://download.eclipse.org/releases/photon). Install the following components under Mobile and Device Development:
* Remote System Explorer End-User Runtime
* Remote System Explorer User Actions
* C/C++ Remote (over TCF/TE) Run/Debug Launcher

Create a C/C++ Remote Application launch configuration where you specify the built executable to be launched. Under "Remote Absolute File Path for C/C++ Application" specify where to copy the executable on the Raspberry Pi (e.g. /home/pi/FireDetectorSample/executable). Under "Commands to execute before application" list the following commands:

```
export LD_LIBRARY_PATH=/usr/local/lib  
export FIRE_DETECTOR_HOME=/home/pi/FireDetectorSample
```

The FIRE_DETECTOR_HOME environment variable is where the application will look for the private Google IoT key you generated above, so make sure you put the key in that location. You also need to put the Google root certificate in the same location. You can download that certificate [here](https://pki.goog/roots.pem).

If you want to immediately run the application specify this command-line argument:
`-URTS_DEBUG=quit`

If you instead prefer to attach the model debugger to it, you can start the application with the command-line argument:
`-obslisten=12345`

and then attach the model debugger on that same port (replace 12345 with a port that is available on your machine).

## Starting the web application
Go to a command shell and set the environment variable GOOGLE_APPLICATION_CREDENTIALS to the full path of the JSON key you downloaded from Google IoT. Then perform the following steps:

```
cd webapp
npm install
node app.js
```

Then open [http://localhost:3000/](http://localhost:3000/) in a web browser

## How the application works
Immediately when the application starts up it will register the device with Google IoT and then read the temperature from the connected temperature sensors. The dataAnalyzer capsule part computes the average temperature and sends it to the Google IoT through the cloudAdapter capsule part. It also sends information about the current state of the sensors. The web application receives these MQTT events and updates the web page accordingly (using websocket communication).  
Whenever the application receives a command to suspend or resume a sensor it will trigger the above procedure once more. You can also trigger the procedure when using the model debugger by manually sending the "getStatus" event to the "externalInterface" port of the FDSystem top capsule instance. If one active sensor measures a temperature that is more than 10 degrees higher than the average temperature, the application considers that to be an indication of an ongoing fire, and will trigger the fire alarm for that sensor.
