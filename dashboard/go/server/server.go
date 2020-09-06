package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/grpclog"
	"google.golang.org/grpc/metadata"

	library "origin/dashboard/go/_proto/examplecom/library"
	originmqtt "origin/dashboard/go/originmqtt"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/context"
)

var devices = []*library.Device{}

func main() {
	ds := deviceService{make(chan *library.Device, 5), make(chan bool)}
	deviceNames := make(map[string]string)
	deviceNames["70217"] = "Alice"
	deviceNames["38E0D"] = "Bob"

	var onRollCall mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
		message := string(msg.Payload())
		switch msg.Topic() {
		case "rollCall":
			if message != "hello" {
				addDevice(deviceNames, message)
			}
		case "ping":
			updatedDevice := addDevice(deviceNames, message)
			ds.dChan <- &updatedDevice
		default:
			fmt.Println("Unhandled MQQT topic:")
		}
		fmt.Printf("TOPIC: %s\n", msg.Topic())
		fmt.Printf("MSG: %s\n", message)
	}

	om := originmqtt.New("192.168.20.11:1883", onRollCall)
	om.Connect()
	om.RollCall()
	serve(&ds)
	om.Disconnect()
}

func addDevice(deviceNames map[string]string, message string) library.Device {
	tokens := strings.Split(message, " ")
	id := tokens[0]

	battery := "?"
	if len(tokens) > 1 {
		battery = tokens[1]
	}

	// Last contact
	now := time.Now()

	// Name
	name, found := deviceNames[id]
	if !found {
		name = "[No name]"
	}

	newDevice := library.Device{
		Id:          id,
		Name:        name,
		Type:        "ESP32 D1 Mini",
		LastContact: fmt.Sprint(now.UTC().Unix()),
		Battery:     battery,
		Version:     "5.2.1",
		Status:      "online",
	}
	devices = append(devices, &newDevice)
	return newDevice
}

func serve(ds *deviceService) {
	port := 9090

	grpcServer := grpc.NewServer()
	library.RegisterDeviceServiceServer(grpcServer,
		ds)
	grpclog.SetLogger(log.New(os.Stdout, "server: ", log.LstdFlags))

	wrappedServer := grpcweb.WrapServer(grpcServer)
	handler := func(resp http.ResponseWriter, req *http.Request) {
		wrappedServer.ServeHTTP(resp, req)
	}

	httpServer := http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: http.HandlerFunc(handler),
	}

	grpclog.Printf("Starting server. http port: %d", port)

	if err := httpServer.ListenAndServe(); err != nil {
		grpclog.Fatalf("failed starting http server: %v", err)
	}
}

type deviceService struct {
	dChan   chan *library.Device
	endChan chan bool
}

func (s *deviceService) GetDevice(ctx context.Context, deviceQuery *library.GetDeviceRequest) (*library.Device, error) {
	grpc.SendHeader(ctx, metadata.Pairs("Pre-Response-Metadata", "Is-sent-as-headers-unary"))
	grpc.SetTrailer(ctx, metadata.Pairs("Post-Response-Metadata", "Is-sent-as-trailers-unary"))

	for _, device := range devices {
		if device.Id == deviceQuery.Id {
			return device, nil
		}
	}

	return nil, grpc.Errorf(codes.NotFound, "Device could not be found")
}

func (s *deviceService) QueryDevices(e *library.Empty, stream library.DeviceService_QueryDevicesServer) error {
	stream.SendHeader(metadata.Pairs("Pre-Response-Metadata", "Is-sent-as-headers-stream"))
	for _, device := range devices {
		stream.Send(device)
	}
	for {
		select {
		case device := <-s.dChan:
			fmt.Println("sending")
			stream.Send(device)
		case <-s.endChan:
			stream.SetTrailer(metadata.Pairs(
				"Post-Response-Metadata", "Is-sent-as-trailers-stream"))
			return nil
		default:
			fmt.Println("sleeping")
			time.Sleep(500 * time.Millisecond)
		}
	}
}
