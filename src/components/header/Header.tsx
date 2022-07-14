import React from "react";
import { Col, Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

function Header() {
  return (
    <Col lg="12">
      <header id="app-header">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand href="#home">Nutra, LLC.</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/blog">Blog</Nav.Link>
                <NavDropdown title="Calculators" id="calculators-dropdown">
                  <NavDropdown.Item href="/calculators/body-fat">Bodyfat</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    </Col>
  );
}

export default Header;
