class SiteHeader extends HTMLElement {
	connectedCallback() {
		this.style.display = 'block';
		this.innerHTML = `
		<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
		<a class="navbar-brand" href="/Home.html">etangaming123</a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
		<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav mr-auto">
			<li class="nav-item">
				<a class="nav-link" href="/Home.html">Home</a>
			</li>
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="navbarDropdownInfo" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Info</a>
				<div class="dropdown-menu" aria-labelledby="navbarDropdownInfo">
				<a class="dropdown-item" href="/Links.html">Links</a>
				<a class="dropdown-item" href="/Friends.html">Friends</a>
				</div>
			</li>
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="navbarDropdownCreations" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Creations</a>
				<div class="dropdown-menu" aria-labelledby="navbarDropdownCreations">
				<a class="dropdown-item" href="https://etanbot.etangaming.xyz">etan bot</a>
				<a class="dropdown-item" href="/TromboneChamp.html">Trombone Champ Charts</a>
				<a class="dropdown-item" href="/maisquared.html">maimai Custom Charts</a>
				</div>
			</li>
			<li class="nav-item dropdown">
				<a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMisc" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Misc</a>
				<div class="dropdown-menu" aria-labelledby="navbarDropdownMisc">
				<a class="dropdown-item" href="/maimai.html">maimai Stats</a>
				</div>
			</li>
			</ul>
			<form class="form-inline my-2 my-lg-0" id="searchForm" autocomplete="off" onsubmit="return handleSearch(event)">
			<input class="form-control mr-sm-2" type="search" placeholder="Looking for smth?" aria-label="Search" id="searchInput">
			<button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
			</form>
			<div id="searchResults"></div>
		</div>
		</nav>
		`;
	}
}

class SiteFooter extends HTMLElement {
	connectedCallback() {
		this.style.display = 'block';
		this.innerHTML = `
		<footer class="text-center">
		<div class="container">
			<div class="row">
			<div class="col-12">
				<p> * <a href="/Redirect.html?redirect=https://getbootstrap.com/" target="_blank">Bootstrap v4.4.1</a><br> * Copyright 2011-2019 The Bootstrap Authors<br> * Copyright 2011-2019 Twitter, Inc.<br> * Licensed under <a href="/Redirect.html?redirect=https://github.com/twbs/bootstrap/blob/master/LICENSE" target="_blank">MIT</a></p>
				<p>etan • etangaming123 • etangamingxyz</p>
			</div>
			</div>
		</div>
		</footer>
		`;
	}
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
