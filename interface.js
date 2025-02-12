// Call this function inside jQuery's document ready
$(document).ready(function () {
    loadNavbar();
    sortTablesByFirstColumn();
    initializeTableSearch();
    initializeFilter();
});


function loadNavbar() {

    if ($('#naviDe').length) {
		$.get("./navbarDe.html", function(data) {
			// Replace the #naviDe div with the content from navbarDe.html
			$('#naviDe').replaceWith(data);
		});
	}
	
	// Check if the #navi div exists
	if ($('#navi').length) {
		$.get("./navbar.html", function(data) {
			// Replace the #navi div with the content from navbar.html
			$('#navi').replaceWith(data);
		});
	}
}

function sortTablesByFirstColumn() {
    // Select all tables on the page excluding those with the "nosort" class
    document.querySelectorAll("table:not(.nosort)").forEach((table) => {
        let rows = Array.from(table.rows).slice(1); // Exclude the header row

        // Sort rows based on the first column
        rows.sort((rowA, rowB) => {
            let cellA = rowA.cells[0].textContent.trim().toLowerCase();
            let cellB = rowB.cells[0].textContent.trim().toLowerCase();
            return cellA.localeCompare(cellB);
        });

        // Append sorted rows back to the table
        rows.forEach(row => table.appendChild(row));
    });
}

// Function to calculate Levenshtein Distance (Edit Distance)
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Initialize the matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Compute the distance
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,     // deletion
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j - 1] + 1  // substitution
                );
            }
        }
    }
    return matrix[len1][len2];
}

// Function to check if a string matches another with a typo tolerance
function isFuzzyMatch(input, target, tolerance = 2) {
    return levenshteinDistance(input, target) <= tolerance;
}



// Function to initialize table search with fuzzy search
function initializeTableSearch() {
    const nameSearchIcon = document.getElementById("nameSearchIcon");
    const nameSearchContainer = document.getElementById("nameSearch");
    const nameSearchInput = document.getElementById("nameSearchInput");
    const searchHeader = document.querySelector(".search-header");

	if (!nameSearchIcon || !nameSearchContainer || !nameSearchInput || !searchHeader) {
        return;
    }

	nameSearchIcon.addEventListener("click", function() {
        if (nameSearchContainer.classList.contains("show")) {
            nameSearchContainer.classList.remove("show");
            searchHeader.classList.remove("hidden"); // Show header when search closes
        } else {
            nameSearchContainer.classList.add("show");
            searchHeader.classList.add("hidden"); // Hide header when search opens
            nameSearchInput.focus();
        }
    });

	document.addEventListener("click", function(event) {
        if (!event.target.closest(".search-icon, .search-container")) {
            nameSearchContainer.classList.remove("show");
            searchHeader.classList.remove("hidden");  // Show header when search closes
        }
    });

    // Toggle search input visibility
    nameSearchIcon.addEventListener("click", function() {
        if (nameSearchContainer.style.display === "block") {
            nameSearchContainer.style.display = "none";
        } else {
            nameSearchContainer.style.display = "block";
            nameSearchInput.focus();  // Focus input when shown
        }
    });

    // Filter table with fuzzy search logic
    nameSearchInput.addEventListener("keyup", function() {
        const searchValue = this.value.toLowerCase().trim();
        const rows = document.querySelectorAll("tbody tr");

        rows.forEach(row => {
            const cellValue = row.cells[1].textContent.toLowerCase().trim();
            
            // Check exact match or fuzzy match with tolerance
            if (cellValue.includes(searchValue) || isFuzzyMatch(searchValue, cellValue)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });

        // Highlight search icon if input is not empty
        nameSearchIcon.classList.toggle("active-search", searchValue !== "");
		
    });

    // Close search box when clicking outside
    document.addEventListener("click", function(event) {
        if (!event.target.closest(".search-icon, .search-container")) {
            nameSearchContainer.style.display = "none";
        }
    });
}

function initializeFilter() {
    const filterIcons = document.querySelectorAll(".filter-icon");

    // Check if filter icons exist before adding event listeners
    if (!filterIcons.length) {
        console.warn("No filter icons found, skipping filter initialization.");
        return;
    }

    filterIcons.forEach(filterIcon => {
        const thElement = filterIcon.closest('th');
        const filterHeader = thElement.querySelector('.filter-header');
        const filterContainer = thElement.querySelector('.filter-container');
        const filterSelect = filterContainer.querySelector('select');

        // Function to determine column index dynamically
        function getColumnIndex(thElement) {
            return Array.from(thElement.parentElement.children).indexOf(thElement);
        }

        // Function to populate dropdown with unique values from the determined column
        function populateFilterOptions() {
            const columnIndex = getColumnIndex(thElement);
            const rows = document.querySelectorAll("tbody tr");
            const uniqueValues = new Set();

            rows.forEach(row => {
                const cellValue = row.cells[columnIndex].textContent.trim();
                if (cellValue) {
                    uniqueValues.add(cellValue);
                }
            });

            filterSelect.innerHTML = ""; // Clear existing options

            // Add "ALL" option at the top
            const allOption = document.createElement("option");
            allOption.value = "all";
            allOption.textContent = "---";
            filterSelect.appendChild(allOption);

            uniqueValues.forEach(value => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                filterSelect.appendChild(option);
            });
        }

		populateFilterOptions();

        // Toggle filter dropdown visibility and hide header text/icon
        filterIcon.addEventListener("click", function() {
            if (filterContainer.classList.contains("show")) {
                filterContainer.classList.remove("show");
                filterIcon.classList.remove("active");
            } else {
                filterContainer.classList.add("show");
                filterIcon.classList.add("active");
            }
        });


		function filterTable() {
            const columnIndex = getColumnIndex(thElement);
            const selectedValues = Array.from(filterSelect.selectedOptions).map(option => option.value.toLowerCase());
            const rows = document.querySelectorAll("tbody tr");

            // If "ALL" is selected, show all rows and deselect other options
            if (selectedValues.includes("all")) {
                rows.forEach(row => row.style.display = "");
                filterSelect.querySelectorAll('option').forEach(option => {
                    option.selected = option.value === "all";  // Keep only "ALL" selected
                });
                return;
            }

            // Filter rows based on selected options
            rows.forEach(row => {
                const cellValue = row.cells[columnIndex].textContent.toLowerCase().trim();
                row.style.display = selectedValues.length === 0 || selectedValues.includes(cellValue) ? "" : "none";
            });

            filterIcon.classList.toggle("active-filter", selectedValues.length > 0 && !selectedValues.includes("all"));
        }

        // Event listener to filter table rows based on selection
        filterSelect.addEventListener("change", filterTable);

        // Close dropdown and show header text/icon when clicking outside
        document.addEventListener("click", function(event) {
            if (!event.target.closest(".filter-icon, .filter-container")) {
                filterContainer.classList.remove("show");
                filterHeader.classList.remove("hidden");
                filterIcon.classList.remove("active");
            }
        });
    });

    console.log("Filter functionality initialized for all filter icons.");
}
