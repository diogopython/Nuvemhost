// Theme toggle functionality
function toggleTheme() {
  const html = document.documentElement
  const icon = document.getElementById("theme-icon")
  const currentTheme = html.getAttribute("data-bs-theme")

  if (currentTheme === "dark") {
    html.setAttribute("data-bs-theme", "light")
    icon.className = "bi bi-moon-fill"
    localStorage.setItem("theme", "light")
  } else {
    html.setAttribute("data-bs-theme", "dark")
    icon.className = "bi bi-sun-fill"
    localStorage.setItem("theme", "dark")
  }
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light"
  const html = document.documentElement
  const icon = document.getElementById("theme-icon")

  if (icon) {
    html.setAttribute("data-bs-theme", savedTheme)
    icon.className = savedTheme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-fill"
  }

  // Add fade-in animation to main content
  const mainContent = document.querySelector(".main-content")
  if (mainContent) {
    mainContent.classList.add("fade-in-up")
  }

  // Auto-hide alerts after 5 seconds
  const alerts = document.querySelectorAll(".alert:not(.alert-permanent)")
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new window.bootstrap.Alert(alert)
      bsAlert.close()
    }, 5000)
  })
})

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Add loading state to buttons on form submit
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", () => {
      const submitBtn = form.querySelector('button[type="submit"]')
      if (submitBtn) {
        const originalText = submitBtn.innerHTML
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Loading...'
        submitBtn.disabled = true

        // Re-enable after 10 seconds as fallback
        setTimeout(() => {
          submitBtn.innerHTML = originalText
          submitBtn.disabled = false
        }, 10000)
      }
    })
  })
})