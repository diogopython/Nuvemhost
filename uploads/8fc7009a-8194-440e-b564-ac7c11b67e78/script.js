// Import modules
// API Configuration
const API_BASE = "https://produtodbapi.nuvemhost.xyz"
let TOKEN = ""
let USERNAME = ""

// DOM Elements
const authContainer = document.getElementById("auth-container")
const appContainer = document.getElementById("app-container")
const loading = document.getElementById("loading")
const loadingText = document.getElementById("loading-text")

// Theme Management Functions
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeIcon(newTheme)
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector("#theme-toggle i")
  if (theme === "dark") {
    themeIcon.className = "fas fa-sun"
  } else {
    themeIcon.className = "fas fa-moon"
  }
}

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  initializeTheme();
  
  if (!(await checkInternetConnection())) {
    showToast("Erro: Não foi possível conectar ao servidor. Verifique sua conexão.", "error")
    return
  }

  if (!(await checkServerConnection())) {
    showToast("Erro: Servidor indisponível. Tente novamente mais tarde.", "error")
    return
  }

  // Try auto-login with stored credentials
  const storedCredentials = await getStoredCredentials()
  if (storedCredentials) {
    await loginWithStoredCredentials(storedCredentials)
  }
})

// Utility Functions
async function getIpAddress() {
  const url = 'https://api.ipify.org?format=json';

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Ocorreu um erro ao buscar o IP:', error);
    return null; // Retorna null em caso de erro
  }
}

function showLoading(text = "Carregando...") {
  loadingText.textContent = text
  loading.classList.remove("hidden")
}

function hideLoading() {
  loading.classList.add("hidden")
}

function showToast(message, type = "info") {
  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message

  document.getElementById("toast-container").appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 5000)
}

async function checkInternetConnection() {
  try {
    await fetch(API_BASE, { method: "HEAD", timeout: 5000 })
    return true
  } catch {
    return false
  }
}

async function checkServerConnection() {
  try {
    const response = await fetch(`${API_BASE}/valid`, { timeout: 10000 })
    const data = await response.json()
    return data.valid
  } catch {
    return false
  }
}

// Gera uma chave AES e salva no localStorage
async function gerarChave() {
    const chave = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // chave exportável
        ["encrypt", "decrypt"]
    );

    // Exporta a chave e salva como Base64
    const chaveExportada = await crypto.subtle.exportKey("raw", chave);
    const chaveBase64 = btoa(String.fromCharCode(...new Uint8Array(chaveExportada)));
    localStorage.setItem("produtos_chave", chaveBase64);

    return chave;
}

// Recupera a chave do localStorage
async function getChave() {
    const chaveBase64 = localStorage.getItem("produtos_chave");
    if (!chaveBase64) return gerarChave(); // se não existir, gera uma nova

    const chaveBytes = Uint8Array.from(atob(chaveBase64), c => c.charCodeAt(0));
    return crypto.subtle.importKey(
        "raw",
        chaveBytes,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

// Criptografa os dados
async function criptografarDados(texto) {
    const chave = await getChave();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const dados = new TextEncoder().encode(texto);

    const criptografado = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        chave,
        dados
    );

    return {
        iv: Array.from(iv),
        data: btoa(String.fromCharCode(...new Uint8Array(criptografado)))
    };
}

// Descriptografa os dados
async function descriptografarDados(cripto) {
    const chave = await getChave();
    const dadosBin = Uint8Array.from(atob(cripto.data), c => c.charCodeAt(0));

    const descriptografado = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(cripto.iv) },
        chave,
        dadosBin
    );

    return new TextDecoder().decode(descriptografado);
}

// Local Storage Functions com criptografia
async function storeCredentials(email, password) {
    const credenciais = JSON.stringify({ email, password });
    const criptografado = await criptografarDados(credenciais);
    localStorage.setItem("produtos_credentials", JSON.stringify(criptografado));
}

async function getStoredCredentials() {
    const stored = localStorage.getItem("produtos_credentials");
    if (!stored) return null;

    const criptografado = JSON.parse(stored);
    const dec = await descriptografarDados(criptografado);
    return JSON.parse(dec);
}

function clearStoredCredentials() {
  localStorage.removeItem("produtos_chave")
  localStorage.removeItem("produtos_credentials")
}

// Auth Functions
function showAuthSelection() {
  document.getElementById("auth-selection").classList.remove("hidden")
  document.getElementById("login-form").classList.add("hidden")
  document.getElementById("register-form").classList.add("hidden")
}

function showLogin() {
  document.getElementById("auth-selection").classList.add("hidden")
  document.getElementById("login-form").classList.remove("hidden")
  document.getElementById("register-form").classList.add("hidden")
}

function showRegister() {
  document.getElementById("auth-selection").classList.add("hidden")
  document.getElementById("login-form").classList.add("hidden")
  document.getElementById("register-form").classList.remove("hidden")
}

async function handleRegister(event) {
  event.preventDefault()

  const nome = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const senha = document.getElementById("register-password").value

  showLoading("Registrando...")

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    })

    if (response.ok) {
      hideLoading()
      showToast("Registro concluído com sucesso!", "success")
      showToast(`Bem-vindo, ${nome}!`, "info")

      // Auto login after registration
      await performLogin(email, senha, false)
    } else {
      const errorData = await response.text()
      throw new Error(errorData)
    }
  } catch (error) {
    hideLoading()
    showToast("Erro ao registrar: " + error.message, "error")
  }
}

async function handleLogin(event) {
  event.preventDefault()

  const email = document.getElementById("login-email").value
  const senha = document.getElementById("login-password").value

  await performLogin(email, senha, false)
}

async function performLogin(email, senha, IsCred) {
  showLoading("Autenticando...")

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        userip: await getIpAddress(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    })

    if (response.ok) {
      const data = await response.json()
      TOKEN = data.tokenUS
      USERNAME = data.username

      hideLoading()
      showToast("Login bem-sucedido!", "success")

      // Ask to save credentials
      if (!IsCred) {
        if (confirm("Deseja salvar as credenciais neste dispositivo?")) {
          await storeCredentials(email, senha)
        }
      }

      showApp()
    } else {
      throw new Error("Credenciais inválidas")
    }
  } catch (error) {
    hideLoading()
    showToast("Falha no login: " + error.message, "error")
  }
}

async function loginWithCredentials() {
  const credentials = await getStoredCredentials()
  if (!credentials) {
    showToast("Credenciais não encontradas.", "error")
    return
  }

  await loginWithStoredCredentials(credentials)
}

async function loginWithStoredCredentials(credentials) {
  showLoading("Verificando credenciais locais...")

  try {
    await performLogin(credentials.email, credentials.password, true)
  } catch (error) {
    hideLoading()
    showToast("Erro ao autenticar com credenciais salvas.", "error")
    clearStoredCredentials()
  }
}

function showApp() {
  authContainer.classList.add("hidden")
  appContainer.classList.remove("hidden")
  document.getElementById("username-display").textContent = `Bem-vindo, ${USERNAME}!`
  loadProducts()
}

async function logout() {
  showLoading("Fazendo logout...")

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    TOKEN = ""
    USERNAME = ""
    clearStoredCredentials()

    hideLoading()
    showToast("Logout realizado. Até logo! 👋", "success")

    appContainer.classList.add("hidden")
    authContainer.classList.remove("hidden")
    showAuthSelection()
  } catch (error) {
    hideLoading()
    if (confirm("Erro ao fazer logout. Deseja sair mesmo assim?")) {
      TOKEN = ""
      USERNAME = ""
      clearStoredCredentials()
      appContainer.classList.add("hidden")
      authContainer.classList.remove("hidden")
      showAuthSelection()
    }
  }
}

// App Navigation
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll(".app-section").forEach((section) => {
    section.classList.add("hidden")
  })

  // Remove active class from all nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Show selected section
  document.getElementById(`${sectionName}-section`).classList.remove("hidden")

  // Add active class to selected nav button
  document.querySelector(`[data-section="${sectionName}"]`).classList.add("active")

  // Load data if needed
  if (sectionName === "list") {
    loadProducts()
  }
}

// Products Functions
async function loadProducts() {
  showLoading("Carregando produtos...")

  try {
    const response = await fetch(`${API_BASE}/produtos`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    if (response.ok) {
      const produtos = await response.json()
      displayProducts(produtos)
    } else {
      throw new Error("Erro ao carregar produtos")
    }
  } catch (error) {
    showToast("Erro ao buscar produtos: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function displayProducts(produtos) {
  const container = document.getElementById("products-table")

  if (!produtos || produtos.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Adicione seu primeiro produto para começar!</p>
            </div>
        `
    return
  }

  const table = `
        <div class="products-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Preço</th>
                        <th>Quantidade</th>
                        <th>Valor total</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${produtos
                      .map(
                        (produto) => `
                        <tr>
                            <td>${produto.id}</td>
                            <td>${produto.nome}</td>
                            <td>R$ ${Number.parseFloat(produto.preco).toFixed(2)}</td>
                            <td>${produto.quantidade}</td>
                            <td>R$ ${Number.parseFloat(produto.preco * produto.quantidade).toFixed(2)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-info btn-sm" onclick="editProduct(${produto.id})">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${produto.id})">
                                        <i class="fas fa-trash"></i> Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `

  container.innerHTML = table
}

async function handleAddProduct(event) {
  event.preventDefault()

  const nome = document.getElementById("product-name").value
  const preco = document.getElementById("product-price").value
  const quantidade = document.getElementById("product-quantity").value

  showLoading("Adicionando produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
      body: JSON.stringify({ nome, preco, quantidade }),
    })

    if (response.ok) {
      showToast("✅ Produto adicionado com sucesso!", "success")
      document.getElementById("product-name").value = ""
      document.getElementById("product-price").value = ""
      document.getElementById("product-quantity").value = ""

      // Switch to list view and reload products
      showSection("list")
    } else {
      throw new Error("Erro ao adicionar produto")
    }
  } catch (error) {
    showToast("Erro ao adicionar produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

async function searchProducts() {
  const query = document.getElementById("search-input").value.trim()

  if (!query) {
    showToast("Digite algo para pesquisar", "warning")
    return
  }

  if (query.toLowerCase() === "sair") {
    document.getElementById("search-input").value = ""
    document.getElementById("search-results").innerHTML = ""
    return
  }

  showLoading("Pesquisando...")

  try {
    const response = await fetch(`${API_BASE}/produtos/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
      body: JSON.stringify({ query }),
    })

    if (response.ok) {
      const data = await response.json()
      const produtos = data.produtos || []
      displaySearchResults(produtos)
    } else {
      throw new Error("Erro na pesquisa")
    }
  } catch (error) {
    showToast("Erro ao pesquisar produtos: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function displaySearchResults(produtos) {
  const resultsContainer = document.getElementById("search-results")

  if (!produtos || produtos.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>Nenhum produto encontrado.</p>
      </div>
    `
    return
  }

  let tableHTML = `
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
  `

  produtos.forEach((produto) => {
    tableHTML += `
      <tr>
        <td>${produto.id}</td>
        <td>${produto.nome}</td>
        <td>R$ ${Number.parseFloat(produto.preco).toFixed(2)}</td>
        <td>${produto.quantidade}</td>
        <td>R$ ${Number.parseFloat(produto.preco * produto.quantidade).toFixed(2)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-warning btn-sm" onclick="editProduct(${produto.id})">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${produto.id})">
              <i class="fas fa-trash"></i> Remover
            </button>
          </div>
        </td>
      </tr>
    `
  })

  tableHTML += `
        </tbody>
      </table>
    </div>
  `

  resultsContainer.innerHTML = tableHTML
}

// Edit Product Functions
async function editProduct(id) {
  showLoading("Carregando produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    if (response.ok) {
      const produtos = await response.json()
      const produto = produtos.find((p) => p.id === id)

      if (produto) {
        document.getElementById("edit-product-id").value = produto.id
        document.getElementById("edit-product-name").value = produto.nome
        document.getElementById("edit-product-price").value = produto.preco
        document.getElementById("edit-product-quantity").value = produto.quantidade

        document.getElementById("edit-modal").classList.remove("hidden")
      } else {
        throw new Error("Produto não encontrado")
      }
    } else {
      throw new Error("Erro ao carregar produto")
    }
  } catch (error) {
    showToast("Erro ao carregar produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

async function handleEditProduct(event) {
  event.preventDefault()

  const id = document.getElementById("edit-product-id").value
  const nome = document.getElementById("edit-product-name").value.trim()
  const preco = document.getElementById("edit-product-price").value
  const quantidade = document.getElementById("edit-product-quantity").value

  if (!nome) {
    showToast("Nome do produto é obrigatório", "warning")
    return
  }

  showLoading("Atualizando produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
      body: JSON.stringify({
        nome,
        preco: Number.parseFloat(preco),
        quantidade: Number.parseInt(quantidade),
      }),
    })

    if (response.ok) {
      showToast("✏️ Produto atualizado com sucesso!", "success")
      closeEditModal()
      loadProducts()
      const searchResults = document.getElementById("search-results")
      if (searchResults.innerHTML.trim() !== "") {
        const searchInput = document.getElementById("search-input")
        if (searchInput.value.trim()) {
          searchProducts()
        }
      }
    } else {
      let errorMessage = "Erro ao atualizar produto"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    showToast("Erro ao atualizar produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden")
}

// Delete Product Functions
function deleteProduct(id) {
  document.getElementById("confirm-delete-btn").onclick = () => confirmDeleteProduct(id)
  document.getElementById("delete-modal").classList.remove("hidden")
}

async function confirmDeleteProduct(id) {
  showLoading("Removendo produto...")

  try {
    const response = await fetch(`${API_BASE}/produtos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        userip: await getIpAddress(), // Passa o IP do usuário
      },
    })

    if (response.ok || response.status === 204) {
      showToast("🗑️ Produto removido com sucesso!", "success")
      closeDeleteModal()
      loadProducts()
      const searchResults = document.getElementById("search-results")
      if (searchResults.innerHTML.trim() !== "") {
        const searchInput = document.getElementById("search-input")
        if (searchInput.value.trim()) {
          searchProducts()
        }
      }
    } else {
      let errorMessage = "Erro ao remover produto"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If response is not JSON, use default message
      }
      throw new Error(errorMessage)
    }
  } catch (error) {
    showToast("Erro ao remover produto: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

function closeDeleteModal() {
  document.getElementById("delete-modal").classList.add("hidden")
}

// Event Listeners
document.getElementById("search-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchProducts()
  }
})

// Close modals when clicking outside
document.getElementById("edit-modal").addEventListener("click", (e) => {
  if (e.target.id === "edit-modal") {
    closeEditModal()
  }
})

document.getElementById("delete-modal").addEventListener("click", (e) => {
  if (e.target.id === "delete-modal") {
    closeDeleteModal()
  }
})