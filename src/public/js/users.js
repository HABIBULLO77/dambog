document.addEventListener("DOMContentLoaded", function () {
  // Select all elements with the class "new-product-status"
  const memberStatusElements = document.querySelectorAll(".member-status");

  // Add event listener for the change event to each select element
  memberStatusElements.forEach(function (element) {
    element.addEventListener("change", async function (e) {
      const id = e.target.id; // The product ID from the select's id attribute
      const memberStatus = e.target.value; // Get the new value from the select

      try {
        // Send POST request to update the product status
        const response = await axios.post(`/admin/user/edit`, {
          _id: id,
          memberStatus: memberStatus,
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
        console.log("Error updating memberStatus", err);
        alert("Product update failed");
      }
    });
  });
});
