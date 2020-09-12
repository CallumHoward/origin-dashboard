package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/grpclog"
	"google.golang.org/grpc/metadata"

	library "origin/dashboard/go/_proto/examplecom/library"
	originmqtt "origin/dashboard/go/originmqtt"
	"origin/dashboard/go/upload"

	mqtt "github.com/eclipse/paho.mqtt.golang"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/context"
)

type deviceService struct {
	dChan    chan *library.Device
	endChan  chan bool
	alive    time.Time
	aliveMux sync.Mutex
	om       *originmqtt.OriginMqtt
}

var devices = map[string]*library.Device{}

func main() {
	deviceNames := make(map[string]string)
	deviceNames["70217"] = "Alice"
	deviceNames["38E0D"] = "Bob"
	deviceNames["18EAD"] = "Charlie"

	var ds deviceService

	// Start HTTP service for file uploads
	go upload.SetupRoutes()

	// Start MQTT service
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
			fmt.Println("Unhandled MQTT topic:")
		}
		// fmt.Printf("TOPIC: %s\n", msg.Topic())
		// fmt.Printf("MSG: %s\n", message)
	}

	om := originmqtt.New("192.168.20.11:1883", onRollCall)
	om.Connect()
	defer om.Disconnect()

	// Subscribe to rollCall and ping topics and send "hello"
	om.RollCall()

	// Start gRPC service
	ds = deviceService{
		make(chan *library.Device),
		make(chan bool, 3),
		time.Now(),
		sync.Mutex{},
		&om,
	}
	serve(&ds) // this blocks
}

func addDevice(deviceNames map[string]string, message string) library.Device {
	tokens := strings.Split(message, ",")
	if len(tokens) != 6 {
		fmt.Printf("Error: unpacked wrong number of tokens from MQTT payload: %s\n", message)
		return library.Device{}
	}
	id := tokens[0]
	deviceType := tokens[1]
	uptime := tokens[2]
	battery := tokens[3]
	version := tokens[4]
	ip := tokens[5]

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
		Type:        deviceType,
		LastContact: now.UTC().Unix(),
		Uptime:      uptime,
		Battery:     battery,
		Version:     version,
		Status:      "online",
		Ip:          ip,
	}
	devices[newDevice.Id] = &newDevice
	return newDevice
}

func serve(ds *deviceService) {
	port := 9090

	grpcServer := grpc.NewServer()
	library.RegisterDeviceServiceServer(grpcServer, ds)
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

func (s *deviceService) IsAlive() bool {
	s.aliveMux.Lock()
	defer s.aliveMux.Unlock()
	return time.Now().Sub(s.alive) < (30 * time.Second)
}

func (s *deviceService) GetDevice(ctx context.Context, deviceQuery *library.GetDeviceRequest) (*library.Device, error) {
	grpc.SendHeader(ctx, metadata.Pairs("Pre-Response-Metadata", "Is-sent-as-headers-unary"))
	grpc.SetTrailer(ctx, metadata.Pairs("Post-Response-Metadata", "Is-sent-as-trailers-unary"))

	if val, ok := devices[deviceQuery.Id]; ok {
		return val, nil
	}

	return nil, grpc.Errorf(codes.NotFound, "Device could not be found")
}

func (s *deviceService) QueryDevices(e *library.Empty, stream library.DeviceService_QueryDevicesServer) error {
	// Reset keep alive
	s.aliveMux.Lock()
	s.alive = time.Now()
	s.aliveMux.Unlock()

	// Stream known devices
	stream.SendHeader(metadata.Pairs("Pre-Response-Metadata", "Is-sent-as-headers-stream"))
	fmt.Printf("sending %d known device(s)\n", len(devices))
	for _, device := range devices {
		stream.Send(device)
	}

	// Stream new devices
	for {
		select {
		case device := <-s.dChan:
			fmt.Println("sending")
			stream.Send(device)
		case <-s.endChan:
			stream.SetTrailer(metadata.Pairs(
				"Post-Response-Metadata", "Is-sent-as-trailers-stream"))
			fmt.Println("end consumer - ended")
			return nil
		default:
			fmt.Printf(".")
			time.Sleep(500 * time.Millisecond)
			if !s.IsAlive() {
				fmt.Println("No keepalive, will now end")
				s.endChan <- true
			}
		}
	}
}

func (s *deviceService) KeepAlive(ctx context.Context, e *library.Empty) (*library.Empty, error) {
	// fmt.Println("going to keep alive")
	s.aliveMux.Lock()
	defer s.aliveMux.Unlock()
	s.alive = time.Now()
	fmt.Println("kept alive")
	return e, nil
}

func (s deviceService) ListVersions(ctx context.Context, e *library.Empty) (*library.Versions, error) {
	fmt.Println("listing versions")
	grpc.SendHeader(ctx, metadata.Pairs("Pre-Response-Metadata", "Is-sent-as-headers-unary"))
	grpc.SetTrailer(ctx, metadata.Pairs("Post-Response-Metadata", "Is-sent-as-trailers-unary"))

	var versions library.Versions
	root := "uploads/"
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if strings.HasSuffix(path, ".bin") {
			versions.Filenames = append(versions.Filenames, path)
		}
		return nil
	})

	if err == nil {
		for _, file := range versions.Filenames {
			fmt.Println(file)
		}
	}

	return &versions, err
}

func (s deviceService) FlashOTA(ctx context.Context,
	flashOTARequest *library.FlashOTARequest) (*library.Empty, error) {
	grpc.SendHeader(ctx, metadata.Pairs("Pre-Response-Metadata", "Is-sent-as-headers-unary"))
	grpc.SetTrailer(ctx, metadata.Pairs("Post-Response-Metadata", "Is-sent-as-trailers-unary"))

	fmt.Println("Updating devices")

	// Ask devices to update to pull specified firmware and update
	for _, device := range flashOTARequest.GetDeviceIds() {
		s.om.FlashOTA(device, flashOTARequest.GetFilename())
	}

	return &library.Empty{}, nil
}
