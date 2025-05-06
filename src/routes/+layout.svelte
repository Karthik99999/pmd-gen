<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-5GECCMYW75"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-5GECCMYW75');
	</script>
	<link rel="icon" type="image/x-icon" href="{base}/favicon.ico" />
	<meta name="description" content="A password generator to create Wonder Mail, rescue passwords, revival passwords and more for Pokemon Mystery Dungeon." />
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
	<a class="navbar-brand" href="{base}/">PMD Gen</a>
	<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
	</button>

	<div class="collapse navbar-collapse" id="navbar">
		<ul class="navbar-nav">
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href={'#'} id="rt-generators" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Rescue Team</a>
				<div class="dropdown-menu" aria-labelledby="rt-generators">
					<a class="dropdown-item" href="{base}/rt-wondermail">Wonder Mail</a>
					<a class="dropdown-item" href="{base}/rt-sosconverter">SOS to A-OK</a>
				</div>
			</li>
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href={'#'} id="rt-generators" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Rescue Team DX</a>
				<div class="dropdown-menu" aria-labelledby="rt-generators">
					<a class="dropdown-item" href="{base}/rtdx-rescue">Rescue</a>
					<a class="dropdown-item" href="{base}/rtdx-revival">Revival</a>
				</div>
			</li>
		</ul>
		<ul class="navbar-nav ml-auto">
			<a href="https://github.com/Karthik99999/pmd-gen" target="_blank" style="font-size:35px" aria-label="GitHub"><i class="bi bi-github" style="color:white"></i></a>
		</ul>
	</div>
</nav>

<div class="container pt-3 mt-3">
	<div class="jumbotron">
		<slot />
	</div>
	<footer class="text-center text-muted">
		<p class="pb-2 mb-2 border-bottom">© 2025 Karthik B. | <a href="https://github.com/Karthik99999/pmd-gen" target="_blank">Source</a></p>
		<p>All game logos used on this site belong to The Pokémon Company. This site is not affiliated with The Pokémon Company or Spike Chunsoft in any way.</p>
	</footer>
</div>
