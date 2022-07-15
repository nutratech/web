import React from "react";
import { Button, Col } from "react-bootstrap";
import { useNavigate } from "react-router";

function Home() {
  const navigate = useNavigate();

  const viewCalculators = () => {
    navigate("/calculators/body-fat");
  };

  return (
    <>
      <section id="hero-banner">
        <div className="px-4 py-5 my-5 text-center">
          <h1 className="display-5 fw-bold">Check out our calculators</h1>
          <Col lg="6" className="mx-auto">
            <p className="lead mb-4">
              We&apos;ve been working hard to add more calculators to the website.
              Check your bodyfat today.
            </p>
            <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <Button
                variant="primary"
                className="btn-lg px-4 gap-3"
                onClick={() => viewCalculators()}
              >
                View calculators
              </Button>
            </div>
          </Col>
        </div>
      </section>
      <section id="nutra-blurb">
        <h3>Nutra</h3>
        <p>
          Nutra is the brainchild of two seasoned software engineers, Shane Jaroch and Kyle Hooks.
          With a combined experience of over 16 years, our goal is to make the most useful and
          intuitive nutrition apps on the market today, while also offering products that support
          your health and good nutrition.
        </p>
      </section>
      <section id="nutra-calculators-blurb">
        <h3>Calculators</h3>
        <p>
          We offer several bodyfat and other calculators for free on our website. It&apos;s our way
          of giving back, and giving you a taste of what our app offerings will be able to do for
          you.
        </p>
      </section>
      <section id="nutra-app-blurb">
        <h3>Nutra Apps</h3>
        <p>
          Our online and mobile apps will allow you to easily track complex data about your health
          and nutrition, create custom recipes, and search for foods with complex criteria, allowing
          you to choose the foods that are truly best for you, your body, and your lifestyle.
        </p>
        <p>These are a work in progress, but look out for them soon.</p>
      </section>
    </>
  );
}

export default Home;
