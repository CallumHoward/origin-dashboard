package originmqtt

import (
	"fmt"
	"log"
	"os"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type originMqtt struct {
	opts   *mqtt.ClientOptions
	client mqtt.Client
}

func New(brokerUri string, onMessage mqtt.MessageHandler) originMqtt {
	mqtt.DEBUG = log.New(os.Stdout, "[mqtt.DEBUG] ", 0)
	mqtt.ERROR = log.New(os.Stdout, "[mqtt.ERROR] ", 0)
	opts := mqtt.NewClientOptions().AddBroker(brokerUri).SetClientID("gotrivial")
	opts.SetKeepAlive(2 * time.Second)
	opts.SetDefaultPublishHandler(onMessage)
	// opts.SetPingTimeout(1 * time.Second)
	om := originMqtt{opts, nil}
	return om
}

func (om *originMqtt) Connect() {
	om.client = mqtt.NewClient(om.opts)
	if om.client == nil {
		panic("ERROR: MQTT client not created!")
	}
	if token := om.client.Connect(); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
}

func (om originMqtt) Disconnect() {
	if token := om.client.Unsubscribe("rollCall"); token.Wait() && token.Error() != nil {
		fmt.Println(token.Error())
	}
	om.client.Disconnect(250)
}

func (om originMqtt) RollCall() {
	if om.client == nil {
		panic("ERROR: MQTT client not connected when used!")
	}
	if token := om.client.Subscribe("rollCall", 0, nil); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}
	token := om.client.Publish("rollCall", 0, false, "hello")
	token.Wait()
}
