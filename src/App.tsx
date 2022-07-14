import React from "react";
import { Col, Container, Nav, Navbar } from "react-bootstrap";
import "./App.scss";

function App() {
  return (
    <Container id="app">
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
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
      </Col>
      <Col lg="12">
        <main id="app-main">
          <section id="nutra-blurb">
            <h3>Nutra</h3>
            <p>
              Nutra is the brainchild of two seasoned software engineers,
              Shane Jaroch and Kyle Hooks. With a combined experience of over
              16 years, our goal is to make the most useful and intuitive nutrition apps
              on the market today, while also offering products that support your
              health and good nutrition.
            </p>
          </section>
          <section id="nutra-calculators-blurb">
            <h3>Calculators</h3>
            <p>
              We offer several bodyfat and other calculators for free on our website.
              It&apos;s our way of giving back, and giving
              you a taste of what our app offerings will be able to do for you.
            </p>
          </section>
          <section id="nutra-app-blurb">
            <h3>Nutra Apps</h3>
            <p>
              Our online and mobile apps will allow you to easily
              track complex data about your health and nutrition,
              create custom recipes, and search for foods with complex criteria,
              allowing you to choose the foods that are truly
              best for you, your body, and your lifestyle.
            </p>
            <p>
              These are a work in progress, but look out for them soon.
            </p>
          </section>
        </main>
      </Col>
      <Col lg="12">
        <footer id="app-footer">
          &copy; 2022 - Nutra, LLC.
        </footer>
      </Col>
    </Container>
  );
}

export default App;
