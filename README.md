# Projekt Mailbox
## Brevlåda med sensor

## Syfte
Underlätta för användaren att veta när posten förväntas att komma utan att själv behöva gå och kolla i brevlådan.

## Användare och kontext
* Användaren ska inte behöva gå ut och kolla posten ifall det inte finns någonting där.
* Användare med funktionsvariationer kan ha svårigheter med att gå ut och kolla i sin brevlåda. Genom att veta när de är post i deras brevlåda, slipper dem att gå och kolla i onödan.

## Krav

### Från ett plusivo kit: 
* Male to male jumper wire 
* ESP8266
* HW-131
* 9 V Batteri
* DC connector
* Breadboard

### Övrigt som krävs:
* Magnet sensor
* Strömbrytare
* Dator
  
### Program: 
* Arduino IDE
* Visual Studio Code
* Mosquitto
  
## Sensorn 
1. Magnet sensorer som ger ut data när magneterna har brutits.
2. Den ena magneten sitter på kanten av locket i brevlådan och den andra reed switch sitter mittemot i självaste lådan.
<img width="400" height="800" alt="image" src="https://github.com/user-attachments/assets/0fa4d61a-bbcb-48af-bba1-264283327d38" />

## Hur sensorn är kopplad:
<img width="4624" height="3472" alt="image" src="https://github.com/user-attachments/assets/9195477f-53d8-4ed5-8aa2-7a358fbb263b" />
1. ESP8266 och HW-131 sätts fast i boardet, se till att  det ser ut som denna bild och att minus är längst ned medan plus är längst upp.
   <img width="934" height="539" alt="image" src="https://github.com/user-attachments/assets/7b66a861-907b-4b74-9a7a-dcdade87bddb" />
   
2. En av magnetsensorns kablar kopplas till ESP8266 `GND`.
3. Den andra kabeln kopplas först in till en strömbrytare, ut från strömbrytaren kopplas en ny kabel till ESP8266 input pin D7.
4. Koppla in DC connecter mellan batteriet och HW-131, lampan ska vara av på HW-131.
5. 3v3 ska vara på för HW-131 längst ned, en kabel ska kopplas från GND till den negativa strömledningen på boardet, en annan kabel ska kopplas från 3v3 till den positiva strömledningen.
   <img width="943" height="362" alt="image" src="https://github.com/user-attachments/assets/2f017c59-7b10-4f2b-b821-9f597cdf0a75" />
6. Avsluta med att koppla in en kompatibel sladd från ESP8266 till din dator. 
    

## I Arduino 

1. Klistra in denna kod i din tomma arduino: 
```c 

// BIBLIOTEK
#include <ESP8266WiFi.h>
#include <ArduinoMqttClient.h>

//DOOR PIN
#define DOOR_SENSOR_PIN  13 // Bestämemr vilken pin DOOR_SENSOR_PIN är, vi använde D7 på ESP8266 som har GPIO13 , används en annan pin använder man talet efter GPIO
int door_state; // current state of door sensor
int prev_door_state;    // previous state of door sensor

//WIFI 
const char* ssid = "  "; // "Fyll i ditt ssid"
const char* password = "  "; // "Fyll i ditt lösenord"

// MQTT
const char* mqtt_server = "   "; // "DIn IP"
const int mqtt_port = 1883; // Port som används 

WiFiClient espClient;
MqttClient mqttClient(espClient);

//BROKER & TOPIC
const char broker[] = "test.mosquitto.org"; // "Välj broker"
int port = 1883; // Välj port 
const char topic[] = "MDU/GRUPP4/Postkoll"; // "Välj ett unikt namn"


// SETUP
void setup() {
  Serial.begin(115200);
 
//DOOR 

  pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP); // Använder 13 som är definerad tidigare, input pullup är en inbygd resistor

  door_state = digitalRead(DOOR_SENSOR_PIN);
  prev_door_state = door_state;


  // ANSLUT TILL WIFI 
  WiFi.begin(ssid, password);
  Serial.print("Ansluter till WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi ansluten!");


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


  prev_door_state = door_state;              // sparar sista state 
  door_state  = digitalRead(DOOR_SENSOR_PIN); // läser nytt state

  
  if (prev_door_state == LOW && door_state == HIGH) { // state change: LOW -> HIGH
    Serial.println("The door-opening has been detected");
   
    mqttClient.beginMessage(topic);
    mqttClient.print("OPEN");
    mqttClient.endMessage();
  }

  delay(200);
  
}
```
2. Fyll i ditt ssid, lösenord och ip-adress, se till att du är uppkopplad på samma nätverk.
3. Under Broker & Topic väljer du din egna topic.
4. Compilera och skicka till din ESP8266.

Koden ovan ansluter din ESP8266 till WIFI och skickar iväg ett meddelande via mqtt till en server under den topic som valts när sensorn öppnas. 

### Dubbelkolla att du kan se meddelandet i command promt.
Hitta vart mosquitto befinner sig, skriv in din broker, port och topic. 
<img width="1428" height="322" alt="image" src="https://github.com/user-attachments/assets/19ade695-0384-4c5e-83f7-e539b6b664b2" />
* Om detta fungerar så kan du koppla ur sladden till ESP8266 och sen sätta på batteriet. Om detta fungerar så är ESP8266 uppkopplat på WIFI.

## I Visual studio code 
1. Clone detta repository till din VSC.
2. Hitta mappen js > öppna schedule.js > hitta MQTT delen
3. Ändra denna del i mqtt delen till eran topic:
```c
const char topic[] = "Er TOPIC";
```

## Go live
1. Öppna upp html filen i live.
2. Öppna console under dev tools 
3. Testa och öppna brevlådan, öppningarna ska synnas i console och visualiseras i diagrammet.

¤ BRA JOBBAT !!! 

