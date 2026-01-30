<script>
  import Contact from "$lib/components/Contact.svelte";
</script>

<svelte:head>
  <title>Contact</title>
</svelte:head>

<section class="contact-page">
  <h1>Contact Me</h1>
  <p>Verify to see my contact details.</p>

  <Contact />
</section>

<style>
  .contact-page {
    max-width: 600px;
    margin: 4rem auto;
    text-align: center;
    padding: 0 1rem;
  }

  h1 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
    color: var(--color-text-muted);
  }
</style>
