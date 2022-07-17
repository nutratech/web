import React from "react";
import { Col, Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router";

import "./Header.scss";

function Header(): JSX.Element {
  const navigate = useNavigate();
  return (
    <Col lg="12">
      <header id="app-header">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand id="nav-home-logo" onClick={
              (): void => {
                navigate({
                  pathname: "/",
                });
              }
            }>Nutra, LLC.</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={
                  (): void => {
                    navigate({
                      pathname: "/",
                    });
                  }
                }>Home</Nav.Link>
                <Nav.Link onClick={
                  (): void => {
                    navigate({
                      pathname: "/blog",
                    });
                  }
                }>Blog</Nav.Link>
                <NavDropdown title="Calculators" id="calculators-dropdown">
                  <NavDropdown.Item onClick={
                    (): void => {
                      navigate({
                        pathname: "/calculators/body-fat",
                      });
                    }
                  }>Bodyfat</NavDropdown.Item>
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
