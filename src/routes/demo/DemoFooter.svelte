<!--
@component
Footer for the svelte-canvas-confetti demo page.
Displays the library GitHub link and the author link, separated by a dot.
-->

<footer>
	<a class="link" href="https://github.com/Castlenine/svelte-canvas-confetti" rel="noopener noreferrer" target="_blank">
		@castlenine/svelte-canvas-confetti
	</a>
	<span class="separator" aria-hidden="true">&middot;</span>
	<p>
		Made by <a class="link" href="https://castlenine.io" rel="noopener noreferrer" target="_blank">Alex Castlenine</a>
	</p>
</footer>

<style>
	footer {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
		padding: 1.25rem 1rem;
		border-top: 1px solid rgb(255 255 255 / 8%);
		color: #c9c9c9;
		font-size: 0.85rem;
	}

	.separator {
		color: #999999;
		user-select: none;
	}

	.link {
		color: #c9c9c9;
		text-decoration: none;
	}

	.link:hover {
		text-decoration: underline;
		text-decoration-color: hsl(280deg 95% 65%);
		text-underline-offset: 2px;
	}
</style>
