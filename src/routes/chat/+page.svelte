<script>
    import { onMount } from 'svelte';
    
    // Auto-redirect variable (optional)
    // let redirect = false;
</script>

<svelte:head>
    <title>Chat | Nutratech</title>
</svelte:head>

<section class="chat-page">
    <h1>Matrix Chat</h1>
    
    <div class="content">
        <p class="intro">
            We use a private Matrix homeserver for secure, decentralized communication.
            You can connect using any Matrix client or use our web client.
        </p>
        
        <div class="action-card">
            <h2>Web Client</h2>
            <p>Access chat directly in your browser.</p>
            <a href="https://matrix.nutra.tk" target="_blank" class="button">Launch Web Client</a>
            <p class="subtext">Opens in a new tab</p>
        </div>

        <div class="server-info">
            <h2>Server Details</h2>
            <ul>
                <li><strong>Homeserver URL:</strong> <code>https://matrix.nutra.tk</code></li>
                <li><strong>Identity Server:</strong> <code>https://matrix.nutra.tk</code> (optional)</li>
            </ul>
        </div>
    </div>
</section>

<style>
    .chat-page {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    h1 {
        border-bottom: 2px solid var(--border-color, #333);
        padding-bottom: 0.5rem;
        margin-bottom: 2rem;
    }

    .intro {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        line-height: 1.6;
    }

    .action-card {
        background: var(--bg-card, #16213e);
        padding: 2rem;
        border-radius: 8px;
        border: 1px solid var(--border-color, #333);
        text-align: center;
        margin-bottom: 2rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .button {
        display: inline-block;
        background: var(--primary, #60a5fa);
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
        margin: 1rem 0;
        transition: background 0.2s;
    }

    .button:hover {
        background: var(--primary-hover, #3b82f6);
        text-decoration: none;
    }

    .subtext {
        font-size: 0.85rem;
        color: var(--text-muted, #888);
    }

    .server-info {
        background: var(--surface-2, #1a1a2e);
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 2rem;
    }

    .server-info h2 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: var(--text-secondary, #aaa);
    }

    .server-info ul {
        list-style: none;
        padding: 0;
    }

    .server-info li {
        margin-bottom: 0.5rem;
        font-family: monospace;
    }
    
    code {
        background: rgba(0,0,0,0.2);
        padding: 0.2em 0.4em;
        border-radius: 3px;
        color: var(--brand, #60a5fa);
    }
</style>
