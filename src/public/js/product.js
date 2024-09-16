const newProductBtn = document.getElementById("newProductBtn");
const cancelProductBtn = document.getElementById("cancelProductBtn");
const productFormSection = document.getElementById("productFormSection");
const productForm = document.getElementById("productForm");

// Show the form when "New Product" button is clicked
newProductBtn.addEventListener("click", function () {
  productFormSection.style.display = "block";
});

// Hide the form when "Cancel" button is clicked
cancelProductBtn.addEventListener("click", function () {
  productFormSection.style.display = "none";
});

// Validate the form before submission
productForm.addEventListener("submit", function (e) {
  // Clear previous error messages
  clearErrorMessages();

  let isValid = true;

  // Check if product name is provided
  const productNameInput = document.getElementById("productName");
  if (!productNameInput.value.trim()) {
    showErrorMessage("productName-error");
    isValid = false;
  }

  // Check if product price is valid
  const productPriceInput = document.getElementById("productPrice");
  if (!productPriceInput.value.trim() || productPriceInput.value <= 0) {
    showErrorMessage("productPrice-error");
    isValid = false;
  }

  // Check if product left count is valid
  const productCountInput = document.getElementById("productLeftCount");
  if (!productCountInput.value.trim() || productCountInput.value <= 0) {
    showErrorMessage("productLeftCount-error");
    isValid = false;
  }

  // Check if product type is selected
  const productTypeInput = document.getElementById("productType");
  if (!productTypeInput.value.trim()) {
    showErrorMessage("productType-error");
    isValid = false;
  }

  // Check if dish volume is selected
  const productSizeInput = document.getElementById("productSize");
  if (!productSizeInput.value.trim()) {
    showErrorMessage("productSize-error");
    isValid = false;
  }

  // Prevent form submission if validation fails
  if (!isValid) {
    e.preventDefault();
  }
});

// Show error message
function showErrorMessage(elementId) {
  document.getElementById(elementId).style.display = "block";
}

// Clear all error messages
function clearErrorMessages() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach(function (error) {
    error.style.display = "none";
  });
}

// Image Preview Logic
function previewImage(event, previewId, uploadId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);
  const upload = document.getElementById(uploadId);

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
      upload.classList.add("image-selected"); // Hide the "+" sign
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
    upload.classList.remove("image-selected"); // Show the "+" sign again
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the class "new-product-status"
  const productStatusElements = document.querySelectorAll(
    ".new-product-status"
  );

  // Add event listener for the change event to each select element
  productStatusElements.forEach(function (element) {
    console.log("Event Listener Attached to:", element.id);
    element.addEventListener("change", async function (e) {
      const id = e.target.id; // The product ID from the select's id attribute
      const productStatus = e.target.value; // Get the new value from the select

      // Debugging: Log to check if values are correct
      console.log("Product ID:", id);
      console.log("Product Status:", productStatus);

      try {
        // Send POST request to update the product status
        const response = await axios.post(`/admin/product/${id}`, {
          productStatus: productStatus,
        });

        const result = response.data;

        if (result.data) {
          // Blur the select element to remove focus
          e.target.blur();
        } else {
          throw new Error(result.message);
          alert("Product update failed");
        }
      } catch (err) {
        console.log("Error updating productStatus", err);
        alert("Product update failed");
      }
    });
  });
});
