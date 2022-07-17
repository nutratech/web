import React from "react";
import { Container, Col, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

import "./MainLayout.scss";

function MainLayout(): JSX.Element {
  return (
    <Container fluid id="app">
      <Row className="mb-3">
        <Header />
      </Row>
      <Row>
        <Col lg="8" sm="12" className="mx-auto">
          <main id="app-main">
            <Outlet />
          </main>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg="8" sm="12" className="mx-auto">
          <Footer />
        </Col>
      </Row>
    </Container>
  );
}

export default MainLayout;
