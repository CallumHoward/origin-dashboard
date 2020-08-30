import React, { useState, useEffect } from "react";
import DeviceTable from "./DeviceTable";
import Section from "./Section";
import { Container, Row, Col } from "reactstrap";
import { queryDevices } from "../index";
import { Device } from "../../_proto/examplecom/library/device_service_pb";

let sourceData: Device[] = [];

export const Hello = () => {
  const [deviceData, setDeviceData] = useState<Device[]>([]);

  const addDevice = (device: Device) => {
    sourceData.push(device);
    const newData = [...sourceData];
    setDeviceData(newData);
  };

  useEffect(() => queryDevices(addDevice), []);

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
              <DeviceTable data={deviceData} />
            </Section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
