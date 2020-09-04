package main

import (
	"fmt"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	originmqtt "origin/dashboard/go/originmqtt"
)

func main() {
	var onRollCall mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
		fmt.Printf("TOPIC: %s\n", msg.Topic())
		fmt.Printf("MSG: %s\n", msg.Payload())
	}

	om := originmqtt.New("192.168.20.11:1883", onRollCall)
	om.Connect()
	om.RollCall()
	time.Sleep(6 * time.Second)
	om.Disconnect()
}
