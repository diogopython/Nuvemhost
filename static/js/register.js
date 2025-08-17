// Password confirmation validation
document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirm_password")

  function validatePasswords() {
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value

    if (confirmPassword && password !== confirmPassword) {
      confirmPasswordInput.setCustomValidity("Passwords do not match")
      confirmPasswordInput.classList.add("is-invalid")
    } else {
      confirmPasswordInput.setCustomValidity("")
      confirmPasswordInput.classList.remove("is-invalid")
    }
  }

  // Validate on input
  confirmPasswordInput.addEventListener("input", validatePasswords)
  passwordInput.addEventListener("input", validatePasswords)

  // Username validation
  const usernameInput = document.getElementById("username")
  usernameInput.addEventListener("input", function () {
    const username = this.value
    const pattern = /^[a-zA-Z0-9_]{3,20}$/

    if (username && !pattern.test(username)) {
      this.setCustomValidity("Username must be 3-20 characters long and contain only letters, numbers, and underscores")
      this.classList.add("is-invalid")
    } else {
      this.setCustomValidity("")
      this.classList.remove("is-invalid")
    }
  })

  // Email validation
  const emailInput = document.getElementById("email")
  emailInput.addEventListener("input", function () {
    const email = this.value
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (email && !pattern.test(email)) {
      this.setCustomValidity("Please enter a valid email address")
      this.classList.add("is-invalid")
    } else {
      this.setCustomValidity("")
      this.classList.remove("is-invalid")
    }
  })

  // Password strength indicator
  passwordInput.addEventListener("input", function () {
    const password = this.value
    const strength = calculatePasswordStrength(password)
    updatePasswordStrength(strength)
  })
})

function calculatePasswordStrength(password) {
  let strength = 0

  if (password.length >= 6) strength += 1
  if (password.length >= 8) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1

  return strength
}

function updatePasswordStrength(strength) {
  const passwordInput = document.getElementById("password")
  let strengthText = ""
  let strengthClass = ""

  if (strength === 0) {
    strengthText = ""
  } else if (strength <= 2) {
    strengthText = "Weak"
    strengthClass = "text-danger"
  } else if (strength <= 4) {
    strengthText = "Medium"
    strengthClass = "text-warning"
  } else {
    strengthText = "Strong"
    strengthClass = "text-success"
  }

  // Remove existing strength indicator
  const existingIndicator = document.querySelector(".password-strength")
  if (existingIndicator) {
    existingIndicator.remove()
  }

  // Add new strength indicator
  if (strengthText) {
    const indicator = document.createElement("div")
    indicator.className = `form-text password-strength ${strengthClass}`
    indicator.innerHTML = `<i class="bi bi-shield-${strength <= 2 ? "exclamation" : strength <= 4 ? "check" : "fill-check"} me-1"></i>Password strength: ${strengthText}`
    passwordInput.parentNode.appendChild(indicator)
  }
}
