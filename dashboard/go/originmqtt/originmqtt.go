package originmqtt

import (
	"fmt"
	"log"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type OriginMqtt struct {
	opts        *mqtt.ClientOptions
	client      mqtt.Client
	msgHandlers map[string]mqtt.MessageHandler
	pingSubbed  bool
}

func New(brokerUri string, onMessage mqtt.MessageHandler) OriginMqtt {
	// mqtt.DEBUG = log.New(os.Stdout, "[mqtt.DEBUG] ", 0)
	mqtt.ERROR = log.New(os.Stdout, "[mqtt.ERROR] ", 0)
	opts := mqtt.NewClientOptions().AddBroker(brokerUri).SetClientID("arbiter")
	opts.SetKeepAlive(2 * time.Second)
	opts.SetDefaultPublishHandler(onMessage)
	// opts.SetPingTimeout(1 * time.Second)
	om := OriginMqtt{opts, nil, nil, false}
	return om
}

func (om *OriginMqtt) Connect() {
	om.client = mqtt.NewClient(om.opts)
	if om.client == nil {
		panic("ERROR: MQTT client not created!")
	}
	if token := om.client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func (om OriginMqtt) Disconnect() {
	if token := om.client.Unsubscribe("rollCall"); token.Wait() && token.Error() != nil {
		fmt.Println(token.Error())
	}
	om.client.Disconnect(250)
}

func (om *OriginMqtt) RollCall() {
	if om.client == nil {
		panic("ERROR: MQTT client not connected when used!")
	}
	if !om.pingSubbed {
		if token := om.client.Subscribe("rollCall", 0, nil); token.Wait() && token.Error() != nil {
			panic(token.Error())
		}
		if token := om.client.Subscribe("ping", 0, nil); token.Wait() && token.Error() != nil {
			panic(token.Error())
		}
		om.pingSubbed = true
	}
	token := om.client.Publish("rollCall", 0, false, "hello")
	token.Wait()
}

func (om OriginMqtt) FlashOTA(device string, file string) {
	if om.client == nil {
		panic("ERROR: MQTT client not connected when used!")
	}
	updateTopic := "update/" + device
	token := om.client.Publish(updateTopic, 0, false, file)
	token.Wait()
	fmt.Printf("Update request fired on %s\n", updateTopic)
}
