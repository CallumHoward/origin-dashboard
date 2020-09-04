package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/grpclog"
	"google.golang.org/grpc/metadata"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	library "origin/dashboard/go/_proto/examplecom/library"
	originmqtt "origin/dashboard/go/originmqtt"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/context"
)

var devices = []*library.Device{}

func main() {
	var onRollCall mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
		message := string(msg.Payload())
		fmt.Printf("TOPIC: %s\n", msg.Topic())
		fmt.Printf("MSG: %s\n", message)
		if message == "hello" {
			return
		}
		newDevice := library.Device{
			Id:          message,
			Name:        "Alice",
			Type:        "ESP32 D1 Mini",
			LastContact: "2 mins ago",
			Battery:     "15%",
			Version:     "5.2.1",
			Status:      "offline",
		}
		devices = append(devices, &newDevice)
	}

	om := originmqtt.New("192.168.20.11:1883", onRollCall)
	om.Connect()
	om.RollCall()
	serve()
	om.Disconnect()
}

func serve() {
	port := 9090

	grpcServer := grpc.NewServer()
	library.RegisterDeviceServiceServer(grpcServer, &deviceService{})
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

type deviceService struct{}

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
		time.Sleep(5000 * time.Millisecond)
		stream.Send(device)
	}
	stream.SetTrailer(metadata.Pairs("Post-Response-Metadata", "Is-sent-as-trailers-stream"))
	return nil
}
