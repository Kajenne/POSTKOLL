# Projekt Mailbox
## Brevlåda med sensor

## Syfte
Underlätta för användaren att veta när ens post har nått brevlådan utan att själv behöva gå och kolla.

## Användare och kontext
* Användaren ska inte behöva gå ut och kolla posten ifall det inte finns någonting där.
* Användare med funktionsvariationer kan ha svårigheter med att gå ut och kolla i sin brevlåda. Genom att veta när de är post i deras brevlåda, slipper dem att gå och kolla i onödan.

## Ide 2.0
1. Magnet sensorer som ger ut data när magneterna har brutits.
2. Den ena mgneten sitter på kanten av locket i brevlådan och den andra magneten sitter mittemot den andra magneten i
3. självaste lådan.
<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/0fa4d61a-bbcb-48af-bba1-264283327d38" />

## Magnet sensor 
### Det som behövs från ett plusivo kit: 
* Male to male jumper wire 
* ESP8266
* HW-131
* 9 V Batteri
* DC connector
* Breadboard

### Övrigt som krävs:
* Magnet sensor

### Hur den är kopplad:
1. ESp och HW-131 sätts fast i varsin ände av boardet. 
2. En magnet av magnetsensorns kabel kopplas till `GND`, den andra till `3v3`.

<img width="4624" height="3472" alt="image" src="https://github.com/user-attachments/assets/9195477f-53d8-4ed5-8aa2-7a358fbb263b" />

## Kod i arduino 
```c

// BIBLIOTEK
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>      // Hhämtar tid från NTP server 
#include <ArduinoMqttClient.h>

//DOOR PIN
#define DOOR_SENSOR_PIN  13 // Bestämemr vilken pin DOOR_SENSOR_PIN är, vi använde D7 på ESP8266 som har GPIO13 , används en annan pin använder man talet efter GPIO
int door_state; // current state of door sensor
int prev_door_state;    // previous state of door sensor

//WIFI 
const char* ssid = "----"; // "Ditt ssid"
const char* password = "----"; // "Ditt lösenord"

// MQTT
const char* mqtt_server = "10.132.171.30"; // "DIn IP"
const int mqtt_port = 1883; // Port som används 

WiFiClient espClient;

MqttClient mqttClient(espClient);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

// NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;  // Sveriges tidszon 
const int daylightOffset_sec = 0;

//BROKER & TOPIC
const char broker[] = "test.mosquitto.org"; // "Välj broker"
int port = 1883; // Välj port 
const char topic[] = "MDU/GRUPP4/Postkoll"; // "Välj ett unikt namn"

const long interval = 8000;
unsigned long previousMillis = 0;

int count = 0;

void printLocalTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Kunde inte hämta tid");
    return;
  }
  char buffer[64];
  strftime(buffer, sizeof(buffer), "%A, %B %d %Y %H:%M:%S", &timeinfo);
  Serial.println(buffer);
}




// SETUP
void setup() {
  Serial.begin(115200);
 
 
//DOOR 

  pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP); // Använder 13 som är definerad tidigare, input pullup är en inbygd resistor

  door_state = digitalRead(DOOR_SENSOR_PIN); 


  // ANSLUT TILL WIFI 
  WiFi.begin(ssid, password);
  Serial.print("Ansluter till WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi ansluten!");

  // STARTA NTP
  timeClient.begin();
timeClient.setTimeOffset(3600); // UTC+1 för Sverige


  if (!mqttClient.connect(broker, port)) {
    Serial.print("MQTT connection failed! Error code =");
    Serial.println(mqttClient.connectError());

    while (1)
    ;
  }
  Serial.println("You've connected to the MQTT broker!");
  Serial.println();

}

void loop() {
 mqttClient.poll();
 timeClient.update();

 prev_door_state = door_state;              // sparar sista state 
  door_state  = digitalRead(DOOR_SENSOR_PIN); // läser nytt state

  
  if (prev_door_state == LOW && door_state == HIGH) { // state change: LOW -> HIGH
    Serial.println("The door-opening has been detected");
   
       mqttClient.beginMessage(topic);
    mqttClient.print("Door: open | Tid: ");
    mqttClient.print(timeClient.getFormattedTime());
    mqttClient.endMessage();
  }

  
  else
  if (prev_door_state == HIGH && door_state == LOW) { // state change: HIGH -> LOW
    Serial.println("The door-closing has been detected");
    
     mqttClient.beginMessage(topic);
    mqttClient.print("Door: closed | Tid: ");
    mqttClient.print(timeClient.getFormattedTime());
    mqttClient.endMessage();
  }

 
  delay(2000); // 2 sekunder 

}
```

### I command promt 
<img width="1428" height="322" alt="image" src="https://github.com/user-attachments/assets/19ade695-0384-4c5e-83f7-e539b6b664b2" />


## Schema
Måndag 8e: Testa koppling och fixa kod som ger data.

Tisdag 9e: Koppla kontroller till dator med wifi.

Onsdag 10e: Möte om vad vi inte blivit klara med tidigare dagar.

Torsdag 11e: All data ska visas på webbsidan.

Fredag 12e: Klar med att sensorn ger data som visas på hemsidan.

Måndag 15e: Bygga vidare webbsidan.

Tisdag 16e: Designa sidan efter användaren.

Onsdag 17e: Möte kolla på hur webbsidan ser ut i samband med all data vi från in från sensorn. Se om 

Torsdag 18e: Presentation 


