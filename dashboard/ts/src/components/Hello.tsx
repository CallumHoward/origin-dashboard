import React, { useState, useEffect } from "react";
import DeviceTable from "./DeviceTable";
import Section from "./Section";
import { FileUploader } from "./FileUploader";
import { Container, Row, Col } from "reactstrap";
import { queryDevices, keepAlive } from "../index";
import { Device } from "../../_proto/examplecom/library/device_service_pb";

let sourceData = new Map<string, Device.AsObject>();

export const Hello = () => {
  const [deviceData, setDeviceData] = useState<Device.AsObject[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  const addDevice = (device: Device) => {
    const d = device.toObject();
    sourceData.set(d.id, d);
    const dataArray = Array.from(sourceData.values());
    setDeviceData(dataArray);
  };

  useEffect(() => queryDevices(addDevice), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(new Date());
    }, 1000);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      console.log("trying to send keep alive");
      keepAlive(); //TODO keep alive per thread
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ backgroundColor: "#eee", height: "100vh", width: "100vw" }}>
      <Container>
        <Row>
          <Col>
            <Section>
              <h1>Dashboard</h1>
            </Section>
          </Col>
        </Row>
        <Row>
          <Col>
            <Section>
              <FileUploader />
            </Section>
          </Col>
        </Row>
        <Row>
          <Col>
            <Section>
              <DeviceTable data={deviceData} now={now} />
            </Section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
