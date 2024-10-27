/* JavaScript for password strength meter and image validation & preview */

// Password Strength Meter Logic
const passwordInput = document.getElementById("memberPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const charLengthCriteria = document.getElementById("char-length");
const uppercaseCriteria = document.getElementById("uppercase");
const lowercaseCriteria = document.getElementById("lowercase");
const numberCriteria = document.getElementById("number");
const specialCharCriteria = document.getElementById("special-char");

passwordInput.addEventListener("input", updatePasswordStrength);

function updatePasswordStrength() {
  const password = passwordInput.value;
  let strength = 0;

  // Reset criteria
  charLengthCriteria.classList.add("text-red-500");
  charLengthCriteria.classList.remove("text-green-500");
  uppercaseCriteria.classList.add("text-red-500");
  uppercaseCriteria.classList.remove("text-green-500");
  lowercaseCriteria.classList.add("text-red-500");
  lowercaseCriteria.classList.remove("text-green-500");
  numberCriteria.classList.add("text-red-500");
  numberCriteria.classList.remove("text-green-500");
  specialCharCriteria.classList.add("text-red-500");
  specialCharCriteria.classList.remove("text-green-500");

  // Check length
  if (password.length >= 6) {
    strength++;
    charLengthCriteria.classList.remove("text-red-500");
    charLengthCriteria.classList.add("text-green-500");
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    strength++;
    uppercaseCriteria.classList.remove("text-red-500");
    uppercaseCriteria.classList.add("text-green-500");
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    strength++;
    lowercaseCriteria.classList.remove("text-red-500");
    lowercaseCriteria.classList.add("text-green-500");
  }

  // Check for numbers
  if (/\d/.test(password)) {
    strength++;
    numberCriteria.classList.remove("text-red-500");
    numberCriteria.classList.add("text-green-500");
  }

  // Check for special characters
  if (/[^A-Za-z0-9]/.test(password)) {
    strength++;
    specialCharCriteria.classList.remove("text-red-500");
    specialCharCriteria.classList.add("text-green-500");
  }

  // Update strength bar
  const strengthPercentage = (strength / 5) * 100;
  strengthBar.style.width = strengthPercentage + "%";

  // Update strength text
  if (strength === 0 || strength === 1) {
    strengthBar.classList.replace("bg-yellow-500", "bg-red-500");
    strengthText.textContent = "Very Weak";
  } else if (strength === 2) {
    strengthBar.classList.replace("bg-red-500", "bg-yellow-500");
    strengthText.textContent = "Weak";
  } else if (strength === 3) {
    strengthBar.classList.replace("bg-red-500", "bg-yellow-500");
    strengthText.textContent = "Moderate";
  } else if (strength === 4) {
    strengthBar.classList.replace("bg-yellow-500", "bg-green-500");
    strengthText.textContent = "Strong";
  } else if (strength === 5) {
    strengthBar.classList.replace("bg-yellow-500", "bg-green-500");
    strengthText.textContent = "Very Strong";
  }
}

// Image Validation and Preview Logic
function validateAndPreviewImage(event) {
  const file = event.target.files[0];
  const validExtensions = ["image/jpeg", "image/jpg", "image/png"];
  const imageError = document.getElementById("image-error");
  const imagePreview = document.getElementById("image-preview");

  if (file && validExtensions.includes(file.type)) {
    imageError.style.display = "none";
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    imageError.style.display = "block";
    event.target.value = "";
    imagePreview.style.display = "none";
  }
}

// Custom Form Validation
const form = document.getElementById("signupForm");

form.addEventListener("submit", function (e) {
  clearErrorMessages();
  let isValid = true;

  // Check nickname
  const memberNickInput = document.getElementById("memberNick");
  if (!memberNickInput.value.trim()) {
    showErrorMessage("memberNick-error");
    memberNickInput.classList.add("input-error");
    isValid = false;
  } else {
    memberNickInput.classList.remove("input-error");
  }

  // Check email
  const memberEmailInput = document.getElementById("memberEmail");
  if (
    !memberEmailInput.value.trim() ||
    !validateEmail(memberEmailInput.value)
  ) {
    showErrorMessage("memberEmail-error");
    memberEmailInput.classList.add("input-error");
    isValid = false;
  } else {
    memberEmailInput.classList.remove("input-error");
  }

  // Check phone number
  const memberPhoneInput = document.getElementById("memberPhone");
  if (!memberPhoneInput.value.trim()) {
    showErrorMessage("memberPhone-error");
    memberPhoneInput.classList.add("input-error");
    isValid = false;
  } else {
    memberPhoneInput.classList.remove("input-error");
  }

  // Check if passwords match
  const passwordInput = document.getElementById("memberPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  if (!passwordInput.value.trim()) {
    showErrorMessage("password-error");
    passwordInput.classList.add("input-error");
    isValid = false;
  } else {
    passwordInput.classList.remove("input-error");
  }

  if (!confirmPasswordInput.value.trim()) {
    showErrorMessage("confirmPassword-error1");
    confirmPasswordInput.classList.add("input-error");
    isValid = false;
  } else {
    confirmPasswordInput.classList.remove("input-error");
  }

  if (passwordInput.value !== confirmPasswordInput.value) {
    showErrorMessage("confirmPassword-error");
    confirmPasswordInput.classList.add("input-error");
    isValid = false;
  } else {
    confirmPasswordInput.classList.remove("input-error");
  }

  // Log validation state
  console.log("Form is valid:", isValid);

  // Prevent form submission if validation fails
  if (!isValid) {
    e.preventDefault(); // Prevent submission
    console.log("Form submission prevented due to validation errors.");
  } else {
    console.log("Form submitted successfully.");
  }
});

function showErrorMessage(elementId) {
  document.getElementById(elementId).style.display = "block";
}

function clearErrorMessages() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(function (error) {
    error.style.display = "none";
  });
}

function validateEmail(email) {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
}

// Function to send or resend the verification code
async function sendVerificationCode() {
  const email = document.getElementById("memberEmail").value;
  const sendCodeButton = document.getElementById("sendCodeButton");

  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    const response = await axios.post("/admin/send-code", { email });

    if (response.status === 200) {
      alert("A verification code has been sent to your email.");
      sendCodeButton.textContent = "Resend Verification Code"; // Change button text
    } else {
      alert(response.data.message || "Failed to send verification code.");
    }
  } catch (error) {
    console.error("Error sending verification code:", error);
    alert("An error occurred while sending the verification code.");
  }
}

// Function to verify the email verification code
async function verifyEmailCode() {
  const email = document.getElementById("memberEmail").value;
  const verificationCode = document.getElementById("verificationCode").value;
  const verificationCodeError = document.getElementById(
    "verificationCode-error"
  );

  if (verificationCode.length !== 6 || isNaN(verificationCode)) {
    verificationCodeError.style.display = "block";
    return;
  } else {
    verificationCodeError.style.display = "none";
  }

  try {
    const response = await axios.post("/admin/verify-code", {
      email,
      verificationCode,
    });

    if (response.status === 200) {
      alert("Code verified successfully.");
      document.getElementById("signUpButton").disabled = false; // Enable Sign Up button
    } else {
      alert(response.data.message || "Invalid or expired verification code.");
    }
  } catch (error) {
    console.error("Error verifying code:", error);
    alert("An error occurred while verifying the code.");
  }
}
