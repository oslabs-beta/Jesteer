<nav class="nav-container">
  <ul>
    <li><a href="/">Download</a></li>
    <li><a href="/#how-to">How it works</a></li>
    <li class="nav-brand"><a href="/" id="jesteer">Jesteer</a></li>
    <li><a href="/#team">Meet the team</a></li>
    <li><a href="/"><img width="25px" src="../img/LinkedInLogo.png" alt="LinkedIn"></a></li>
    <li><a href="https://github.com/oslabs-beta/Jesteer"><img width="25px" src="../img/GitHubLogo.png" alt="Github"></a></li>
  </ul>
  <hr>
</nav>

<style>
  .nav-container {
    margin: 2.2rem auto;
    width: 70%;
  }

  ul {
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  li a {
    position: relative;
    font-weight: 1.6rem;
  }

  li a:after {
    position: absolute;
    content: "";
    left: 0;
    bottom: -1rem;
    width: 50%;
    background: #333;
    transition: height 0.4s;
  }

  a:hover:after {
    height: 3px;
    transition: height 0.4s;
  }

  .nav-brand {
    font-weight: 700;
    font-size: 3rem;
  }

  hr {
    margin-top: 1.6rem;
    width: 100%;
    height: 2px;
    border-width:0;
    color: black;
    background-color: black;
  }
</style>