<script>
    import { onMount } from 'svelte';
    
    // Placeholder Site Key (Always strict on local/dev unless configured)
    const SITE_KEY = "0x4AAAAAAxB6Q5rXvC8n_l_w"; // Dummy key for testing or replace via ENV

    let token = "";
    let contactData = null;
    let error = "";
    let loading = false;

    // Turnstile Callback
   window.onTurnstileSuccess = async (t) => {
        token = t;
        loading = true;
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            if (res.ok) {
                contactData = await res.json();
            } else {
                error = "Validation failed. Please try again.";
            }
        } catch (e) {
            error = "Network error.";
        } finally {
            loading = false;
        }
    };

    onMount(() => {
        // Inject script if not present
        if (!document.getElementById('turnstile-script')) {
            const script = document.createElement('script');
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
            script.id = "turnstile-script";
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }
    });
</script>

<div class="contact-section">
    <h2>Contact</h2>
    
    {#if contactData}
        <div class="secrets fade-in">
            <div class="item">
                <span class="label">Email:</span>
                <a href="mailto:{contactData.email}">{contactData.email}</a>
            </div>
            <div class="item">
                <span class="label">Matrix:</span>
                <code>{contactData.matrix}</code>
            </div>
             <div class="item">
                <span class="label">GPG:</span>
                <pre>{contactData.gpg}</pre>
            </div>
        </div>
    {:else}
        <p>Please verify you are human to see contact details.</p>
        <div class="cf-turnstile" data-sitekey={SITE_KEY} data-callback="onTurnstileSuccess"></div>
        {#if error}
            <p class="error">{error}</p>
        {/if}
    {/if}
</div>

<style>
    .contact-section {
        margin: 2rem 0;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .item { margin-bottom: 0.5rem; }
    .label { font-weight: bold; margin-right: 0.5rem; color: #aaa; }
    pre { background: #111; padding: 0.5rem; overflow-x: auto; }
    .error { color: #ff5555; }
    .fade-in { animation: fadeIn 0.5s ease-in; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
</style>
