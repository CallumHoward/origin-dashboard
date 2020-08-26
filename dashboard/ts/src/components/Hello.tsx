import React, { useState, useRef } from "react";
import DeviceTable, { IElement } from "./DeviceTable";
import Section from "./Section";
import { Container, Row, Col } from "reactstrap";

const updateRateMS = 16000;
let sourceData: IElement[] = [];

export const Hello = () => {
  const [deviceData, setDeviceData] = useState<IElement[]>([]);
  const timerRunning = useRef(false);

  if (!timerRunning.current) {
    timerRunning.current = true;
    setInterval(() => {
      const row = makeRow(sourceData.length);
      if (!row) {
        return;
      }
      sourceData.push(row);
      const newData = [...sourceData];
      setDeviceData(newData);
    }, updateRateMS);
  }

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

function makeRow(id: number) {
  let r = Math.floor(Math.random() * 3) + 1;
  if (r == 0) {
    return { col2: "Stacey" } as IElement;
  }
  if (r == 1) {
    return { col2: "Monica" } as IElement;
  }
  if (r == 2) {
    return { col2: "Jessica" } as IElement;
  }
  if (r == 3) {
    return { col2: "Lucy" } as IElement;
  }
  return undefined;
}
