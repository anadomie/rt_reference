
$(document).ready(function () {
    loadNavbar();
	sortTablesByFirstColumn();
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