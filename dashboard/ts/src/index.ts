import { grpc } from "@improbable-eng/grpc-web";
import { DeviceService } from "../_proto/examplecom/library/device_service_pb_service";
import {
  Device,
  GetDeviceRequest,
  Empty,
} from "../_proto/examplecom/library/device_service_pb";

declare const USE_TLS: boolean;
const host = USE_TLS ? "https://localhost:9091" : "http://localhost:9090";

export const getDevice = () => {
  const getDeviceRequest = new GetDeviceRequest();
  getDeviceRequest.setId(60929871);
  grpc.unary(DeviceService.GetDevice, {
    request: getDeviceRequest,
    host: host,
    onEnd: (res) => {
      const { status, statusMessage, headers, message, trailers } = res;
      console.log("getDevice.onEnd.status", status, statusMessage);
      console.log("getDevice.onEnd.headers", headers);
      if (status === grpc.Code.OK && message) {
        console.log("getDevice.onEnd.message", message.toObject());
      }
      console.log("getDevice.onEnd.trailers", trailers);
      // queryDevices();
    },
  });
};

export const queryDevices = (onDevice?: (device: Device) => void) => {
  const queryDevicesRequest = new Empty();
  const client = grpc.client(DeviceService.QueryDevices, {
    host: host,
  });
  client.onHeaders((headers: grpc.Metadata) => {
    // console.log("queryDevices.onHeaders", headers);
  });
  client.onMessage((message: Device) => {
    console.log("queryDevices.onMessage", message.toObject());
    onDevice && onDevice(message);
  });
  client.onEnd((code: grpc.Code, msg: string, trailers: grpc.Metadata) => {
    // console.log("queryDevices.onEnd", code, msg, trailers);
  });
  client.start();
  client.send(queryDevicesRequest);
};
