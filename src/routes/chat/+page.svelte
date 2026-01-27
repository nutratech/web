<script>
    import { onMount } from 'svelte';
</script>

<svelte:head>
    <title>Chat | Nutratech</title>
</svelte:head>

<section class="chat-page">
    <iframe 
        src="https://matrix.nutra.tk" 
        title="Matrix Chat"
        allow="camera; microphone; fullscreen; clipboard-read; clipboard-write; autoplay"
    ></iframe>
</section>

<style>
    .chat-page {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        /* Calculate height to fill space between header and footer if possible, 
           but min-height is a safe fallback */
        min-height: 80vh; 
        padding: 0;
        margin: 0;
        max-width: none; /* Override container max-width if necessary, though layout controls this */
    }

    iframe {
        width: 100%;
        height: 100%;
        flex-grow: 1;
        border: none;
        background: var(--bg-card, #16213e);
        display: block;
    }
</style>
