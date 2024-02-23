<script>
	import { base } from '$app/paths';
</script>

<svelte:head>
	<title>PMD Gen | Generate passwords for Pokemon Mystery Dungeon</title>
</svelte:head>

<center>
	<h3>Generators</h3>
</center>
<div class="row m-3 justify-content-center">
	<div class="col-sm-auto">
		<div class="card" style="background:linear-gradient(to bottom right, #ED1C24, #0097DC)">
			<img src="{base}/RRT_BRT_LOGO.png" class="card-img-top" alt="Rescue_Team" />
			<div class="card-body btn-group" style="width: 100%;">
				<a class="btn btn-info" href="{base}/rt-wondermail">Wonder Mail</a>
				<a class="btn btn-info" href="{base}/rt-sosconverter">SOS to A-OK</a>
			</div>
		</div>
	</div>
	<div class="col-sm-auto">
		<div class="card" style="background:linear-gradient(#ED1C24, #0097DC)">
			<img src="{base}/RTDX_LOGO.png" class="card-img-top" alt="Rescue_Team_DX" />
			<div class="card-body btn-group" style="width: 100%;">
				<a class="btn btn-info" href="{base}/rtdx-rescue">Rescue</a>
				<a class="btn btn-info" href="{base}/rtdx-revival">Revival</a>
			</div>
		</div>
	</div>
</div>

<style>
	.card {
		border: none;
		width: 20rem;
	}

	.card-img-top {
		padding: 2%;
	}

	.btn-info {
		border: 1px solid #0c798a;
	}
</style>
