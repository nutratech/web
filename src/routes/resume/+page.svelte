<script>
  import ProtectedDownload from "$lib/components/ProtectedDownload.svelte";
</script>

<svelte:head>
  <title>Resume Download</title>
</svelte:head>

<section class="resume-page">
  <h1>Download My Resume</h1>
  <p>Please verify you are human to access the file.</p>

  <div class="download-wrapper">
    <ProtectedDownload />
  </div>
</section>

<style>
  .resume-page {
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
    color: var(--color-text-light, #666);
  }

  .download-wrapper {
    display: flex;
    justify-content: center;
  }
</style>
