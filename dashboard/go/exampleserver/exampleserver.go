package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/grpclog"
	"google.golang.org/grpc/metadata"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/context"
	library "origin/dashboard/go/_proto/examplecom/library"
)

var (
	enableTls       = flag.Bool("enable_tls", false, "Use TLS - required for HTTP2.")
	tlsCertFilePath = flag.String("tls_cert_file", "../../misc/localhost.crt", "Path to the CRT/PEM file.")
	tlsKeyFilePath  = flag.String("tls_key_file", "../../misc/localhost.key", "Path to the private key file.")
)

func main() {
	flag.Parse()

	port := 9090
	if *enableTls {
		port = 9091
	}

	grpcServer := grpc.NewServer()
	library.RegisterDeviceServiceServer(grpcServer, &deviceService{})
	grpclog.SetLogger(log.New(os.Stdout, "exampleserver: ", log.LstdFlags))

	wrappedServer := grpcweb.WrapServer(grpcServer)
	handler := func(resp http.ResponseWriter, req *http.Request) {
		wrappedServer.ServeHTTP(resp, req)
	}

	httpServer := http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: http.HandlerFunc(handler),
	}

	grpclog.Printf("Starting server. http port: %d, with TLS: %v", port, *enableTls)

	if *enableTls {
		if err := httpServer.ListenAndServeTLS(*tlsCertFilePath, *tlsKeyFilePath); err != nil {
			grpclog.Fatalf("failed starting http2 server: %v", err)
		}
	} else {
		if err := httpServer.ListenAndServe(); err != nil {
			grpclog.Fatalf("failed starting http server: %v", err)
		}
	}
}

type deviceService struct{}

var devices = []*library.Device{
	{
		Id:          60929871,
		Name:        "Alice",
		Type:        "ESP32 D1 Mini",
		LastContact: "2 mins ago",
		Battery:     "15%",
		Version:     "5.2.1",
		Status:      "offline",
	},
	{
		Id:          140009728,
		Name:        "Bob",
		Type:        "ESP32 D1 Mini",
		LastContact: "2 mins ago",
		Battery:     "15%",
		Version:     "5.2.1",
		Status:      "offline",
	},
	{
		Id:          9780140301694,
		Name:        "Charlie",
		Type:        "ESP32 D1 Mini",
		LastContact: "2 mins ago",
		Battery:     "15%",
		Version:     "5.2.1",
		Status:      "offline",
	},
	{
		Id:          140008381,
		Name:        "David",
		Type:        "ESP32 D1 Mini",
		LastContact: "2 mins ago",
		Battery:     "15%",
		Version:     "5.2.1",
		Status:      "offline",
	},
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
	stream.SetTrailer(metadata.Pairs("Post-Response-Metadata", "Is-sent-as-trailers-stream"))
	return nil
}
