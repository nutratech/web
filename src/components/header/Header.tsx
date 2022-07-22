import React from "react";
import { Col, Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate } from "react-router";
import HeaderService from "./HeaderService";

import "./Header.scss";

function Header(): JSX.Element {
  const navigate = useNavigate();

  return (
    <Col lg="12">
      <header id="app-header">
        <Navbar bg="light" expand="lg">
          <Container>
            <Navbar.Brand
              id="nav-home-logo"
              onClick={HeaderService.navigateRouter.bind(null, navigate, "/")}
            >
              Nutra, LLC.
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={HeaderService.navigateRouter.bind(null, navigate, "/")}>
                  Home
                </Nav.Link>
                <Nav.Link onClick={HeaderService.navigateRouter.bind(null, navigate, "/blog")}>
                  Blog
                </Nav.Link>
                <NavDropdown title="Calculators" id="calculators-dropdown">
                  <NavDropdown.Item
                    onClick={HeaderService.navigateRouter.bind(
                      null,
                      navigate,
                      "/calculators/body-fat"
                    )}
                  >
                    Bodyfat
                  </NavDropdown.Item>
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
