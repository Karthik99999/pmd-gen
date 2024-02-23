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

<div id="page-container">
	<div id="content-wrap">
		<!-- Top Navbar -->
		<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
			<a class="navbar-brand" href={base}>PMD Gen</a>
			<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
				<span class="navbar-toggler-icon"></span>
			</button>

			<div class="collapse navbar-collapse" id="navbar">
				<ul class="navbar-nav ml-auto">
					<a href="https://github.com/Karthik99999/pmd-gen" target="_blank" style="font-size:35px"><i class="fab fa-github" style="color:white"></i></a>
				</ul>
			</div>
		</nav>
		<!-- Jumbotron -->
		<div class="container">
			<div class="col-md-12">
				<br />
				<div class="jumbotron" id="jumbotron">
					<slot />
				</div>
			</div>
		</div>
	</div>
	<footer>
		© 2024 Karthik99999 | <a href="https://github.com/Karthik99999/pmd-gen" target="_blank">Source</a>
		<br />
		All game logos used on this site belong to The Pokémon Company. This site is not affiliated with The Pokémon Company or Spike Chunsoft in any way.
	</footer>
</div>

<style>
	#page-container {
		position: relative;
		min-height: 100vh;
	}

	#content-wrap {
		padding-bottom: 2.5rem; /* Footer height */
	}

	footer {
		text-align: center;
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 4rem;
	}
</style>
