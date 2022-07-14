import React from "react";
import { Container, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";

function MainLayout() {
  return (
    <Container id="app">
      <Header />
      <Col lg="12">
        <main id="app-main">
          <Outlet />
        </main>
      </Col>
      <Footer />
    </Container>
  );
}

export default MainLayout;
