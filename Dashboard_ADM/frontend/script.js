const sideLinks = document.querySelectorAll(".sidebar .side-menu li a:not(.logout)");

sideLinks.forEach((item) => {
  const li = item.parentElement;
  item.addEventListener("click", () => {
    sideLinks.forEach((i) => {
      i.parentElement.classList.remove("active");
    });
    li.classList.add("active");
  });
});

const menuBar = document.querySelector(".content nav .bx.bx-menu");
const sideBar = document.querySelector(".sidebar");

menuBar.addEventListener("click", () => {
  sideBar.classList.toggle("close");
});

const searchBtn = document.querySelector(".content nav form .form-input button");
const searchBtnIcon = document.querySelector(".content nav form .form-input button .bx");
const searchForm = document.querySelector(".content nav form");

searchBtn.addEventListener("click", function (e) {
  if (window.innerWidth < 576) {
    e.preventDefault();
    searchForm.classList.toggle("show");
    if (searchForm.classList.contains("show")) {
      searchBtnIcon.classList.replace("bx-search", "bx-x");
    } else {
      searchBtnIcon.classList.replace("bx-x", "bx-search");
    }
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    sideBar.classList.add("close");
  } else {
    sideBar.classList.remove("close");
  }

  if (window.innerWidth > 576) {
    searchBtnIcon.classList.replace("bx-x", "bx-search");
    searchForm.classList.remove("show");
  }
});

const toggler = document.getElementById("theme-toggle");

toggler.addEventListener("change", function () {
  this.checked ? document.body.classList.add("dark") : document.body.classList.remove("dark");
});

async function loadPage(page) {
  try {
    const response = await fetch(page);
    const html = await response.text();
    const content = document.getElementById('content');
    content.innerHTML = html;

    const scripts = content.querySelectorAll("script");
    scripts.forEach(oldScript => {
      const newScript = document.createElement("script");
      newScript.text = oldScript.textContent;
      document.body.appendChild(newScript).parentNode.removeChild(newScript);
    });

    initFormColaborador();

    // Carrega colaboradores somente se a página for "colaboradores.html"
    if (page === 'colaboradores.html') {
      carregarColaboradores();
    }

  } catch (error) {
    console.error("Erro ao carregar página:", error);
    document.getElementById('content').innerHTML = '<p>Erro ao carregar a página.</p>';
  }
}

const menuItems = document.querySelectorAll('.side-menu li a');
menuItems.forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    const page = this.getAttribute('data-page');
    if (page) {
      loadPage(page);
    }
  });
});

const inicioButton = document.getElementById('inicio');
if (inicioButton) {
  inicioButton.addEventListener('click', function (e) {
    e.preventDefault();
    loadPage('dashboard.html');
  });
}

loadPage('dashboard.html');

function initFormColaborador() {
  const form = document.getElementById("form-colaborador");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      try {
        const response = await fetch("/api/colaboradores/criar", {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        if (response.ok) {
          alert("Colaborador cadastrado com sucesso!");
          form.reset();
        } else {
          throw new Error(result.error || "Erro ao cadastrar colaborador.");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao cadastrar colaborador. Verifique o console.");
      }
    });
  }

  const inputFile = document.getElementById("profile-picture");
  const fileNameDisplay = document.getElementById("file-name");
  if (inputFile && fileNameDisplay) {
    inputFile.addEventListener("change", function(event) {
      const file = event.target.files[0];
      fileNameDisplay.textContent = file ? file.name : 'Nenhum arquivo escolhido';
    });
  }
}

async function carregarColaboradores() {
  try {
    const response = await fetch("/api/colaboradores");
    const data = await response.json();
    const tabela = document.querySelector("#tabela-colaboradores tbody");
    if (!tabela) return;
    tabela.innerHTML = "";

    data.forEach(colaborador => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${colaborador.nome}</td>
        <td>${colaborador.email}</td>
        <td>${colaborador.telefone}</td>
        <td>${colaborador.turma}</td>
        <td>${colaborador.sala}</td>
        <td>${new Date(colaborador.data).toLocaleDateString()}</td>
        <td>${colaborador.horario}</td>
        <td><img src="${colaborador.foto}" style="width: 50px;" /></td>
        <td>
          <button onclick="abrirEdicao(${colaborador.id})">Editar</button>
          <button onclick="confirmarExclusao(${colaborador.id})">Excluir</button>
        </td>
      `;

      tabela.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar colaboradores:", error);
  }
}

async function confirmarExclusao(id) {
  const confirmacao = confirm("Tem certeza que deseja excluir este colaborador?");
  if (!confirmacao) return;

  try {
    const response = await fetch(`/api/colaboradores/${id}`, {
      method: "DELETE"
    });

    const result = await response.json();
    if (response.ok) {
      alert("Colaborador excluído com sucesso.");
      carregarColaboradores(); // Atualiza a lista
    } else {
      throw new Error(result.error || "Erro ao excluir colaborador.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao excluir colaborador.");
  }
}

function carregarPerfil(id) {
  fetch(`http://localhost:3000/api/colaboradores/${id}`)
    .then(response => response.json())
    .then(colaborador => {
      const perfilDiv = document.getElementById('perfil-colaborador');
      if (!perfilDiv) return;
      perfilDiv.innerHTML = `
        <p><strong>Nome:</strong> ${colaborador.nome}</p>
        <p><strong>Email:</strong> ${colaborador.email}</p>
        <p><strong>Telefone:</strong> ${colaborador.telefone}</p>
        <p><strong>Turma:</strong> ${colaborador.turma}</p>
        <p><strong>Sala:</strong> ${colaborador.sala}</p>
        <p><strong>Data:</strong> ${new Date(colaborador.data).toLocaleDateString()}</p>
        <p><strong>Horário:</strong> ${colaborador.horario}</p>
        ${colaborador.foto ? `<img src="${colaborador.foto}" alt="Foto do Colaborador" style="width: 100px;">` : ''}
      `;
    })
    .catch(error => console.error('Erro ao carregar perfil:', error));
}

function carregarHorarios() {
  fetch('http://localhost:3000/api/colaboradores')
    .then(response => response.json())
    .then(data => {
      const tabela = document.getElementById('tabela-horarios')?.getElementsByTagName('tbody')[0];
      if (!tabela) return;
      tabela.innerHTML = '';
      data.forEach(colaborador => {
        const row = tabela.insertRow();
        row.insertCell().textContent = colaborador.nome;
        row.insertCell().textContent = new Date(colaborador.data).toLocaleDateString();
        row.insertCell().textContent = colaborador.horario;
      });
    })
    .catch(error => console.error('Erro ao carregar horários:', error));
}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
if (id) {
  carregarPerfil(id);
}
