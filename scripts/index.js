/*
    File: index.js
    GUI Assignment: HW4 Part 2 - jQuery UI Slider and Tab Widgets
    Platon Supranovich, UMass Lowell Computer Science, Platon_Supranovich@student.uml.edu
    Copyright (c) 2025 by Platon. All rights reserved. May be freely copied or
    excerpted for educational purposes with credit to the author.
    updated by PS on November 18, 2025 at 8:00 AM
*/

$(document).ready(function () {
    const MIN_VAL = -50;
    const MAX_VAL = 50;
    let tabCounter = 1;
    // Initialize tabs 
    const $tabs = $("#tabs").tabs();
    
    // Custom method: end >= start
    $.validator.addMethod("greaterThanOrEqual", function (value, element, param) {
        const startVal = parseFloat($(param).val());
        const endVal = parseFloat(value);
        return this.optional(element) || (!isNaN(startVal) && !isNaN(endVal) && startVal <= endVal);
    }, "End value must be greater than or equal to the start value.");

    // Function to check if all inputs are valid and update the dynamic preview table
    const checkValidationAndUpdatePreview = function () {
        const form = $("#tableForm");
        // Only run if the form is valid to prevent generating a table from invalid data
        if (form.valid()) {
            updatePreviewTable();
        } else {
             // If validation fails, clear the preview table content
            $("#resultTable").empty().html('<thead><tr><th style="min-width: 100%; padding: 20px;">Enter valid parameters to see the dynamic preview.</th></tr></thead>');
        }
    };
    
    // Attach keyup/change listeners to input fields for dynamic updates/two-way binding
    // This handles user typing/pasting into the input field
    $(".input-group input[type='number']").on("keyup change", function () {
        const $input = $(this);
        const inputId = $input.attr("id");
        const value = parseFloat($input.val());

        // Update the corresponding slider's position (Input to Slider binding)
        if (!isNaN(value)) {
            // Clamp value to min/max before setting slider position
            const clampedValue = Math.min(Math.max(value, MIN_VAL), MAX_VAL);
            $(`#${inputId}-slider`).slider("value", clampedValue);
        }

        // Manually re-validate the element when input changes
        validator.element($input);
        
        // Update the dynamic preview table
        checkValidationAndUpdatePreview();
    });

    // Initialize the validator
    const validator = $("#tableForm").validate({
        rules: {
            startCol: { required: true, number: true, min: MIN_VAL, max: MAX_VAL },
            endCol:   { required: true, number: true, min: MIN_VAL, max: MAX_VAL, greaterThanOrEqual: "#startCol" },
            startRow: { required: true, number: true, min: MIN_VAL, max: MAX_VAL },
            endRow:   { required: true, number: true, min: MIN_VAL, max: MAX_VAL, greaterThanOrEqual: "#startRow" }
        },
        messages: {
            startCol: {
                required: "Please enter a Start Multiplier.",
                number: "Must be a valid number.",
                min: `Cannot be less than ${MIN_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`,
                max: `Cannot be greater than ${MAX_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`
            },
            endCol: {
                required: "Please enter an End Multiplier.",
                number: "Must be a valid number.",
                min: `Cannot be less than ${MIN_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`,
                max: `Cannot be greater than ${MAX_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`
            },
            startRow: {
                required: "Please enter a Start Multiplicand.",
                number: "Must be a valid number.",
                min: `Cannot be less than ${MIN_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`,
                max: `Cannot be greater than ${MAX_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`
            },
            endRow: {
                required: "Please enter an End Multiplicand.",
                number: "Must be a valid number.",
                min: `Cannot be less than ${MIN_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`,
                max: `Cannot be greater than ${MAX_VAL}. Please enter a number from ${MIN_VAL} to ${MAX_VAL}.`
            }
        },
        errorElement: "div",
        errorClass: "error-message",
        highlight: function (element) {
            $(element).addClass("error-input");
        },
        unhighlight: function (element) {
            $(element).removeClass("error-input");
        },
        errorPlacement: function (error, element) {
            element.closest(".input-group").find(".error-placeholder").html(error);
        },
        submitHandler: function (form) {
            saveTableToNewTab();
        },
        // Disable validation on keyup for better slider/input interaction performance
        onkeyup: false,
        // Validate on click/change of elements (like sliders)
        onclick: true
    });

    const inputIds = ["startCol", "endCol", "startRow", "endRow"];

    inputIds.forEach(function (id) {
        $(`#${id}-slider`).slider({
            min: MIN_VAL,
            max: MAX_VAL,
            step: 1,
            // Initial value is taken from the input field
            value: parseFloat($(`#${id}`).val()) || 0,
            
            // Two-Way Binding: Slider to Input & Dynamic Update
            slide: function (event, ui) {
                const $input = $(`#${id}`);
                // Set input value and trigger change event
                $input.val(ui.value).trigger('change'); 
                
                // Trigger validation and update the preview table
                validator.element($input);
                checkValidationAndUpdatePreview();
            },
            
            // Ensures slider position is updated on initial load or if input had a value
            create: function(event, ui) {
                const $input = $(`#${id}`);
                if ($input.val()) {
                    $(this).slider("value", parseFloat($input.val()));
                }
            }
        });
    });

    function generateTableHTML(sc, ec, sr, er) {
        let tableHTML = `<table class="resultTable">`;

        // Header Row
        tableHTML += "<thead><tr><th></th>";
        for (let j = sc; j <= ec; j++) tableHTML += `<th>${j}</th>`;
        tableHTML += "</tr></thead><tbody>";

        // Body Rows
        for (let i = sr; i <= er; i++) {
            tableHTML += `<tr><th>${i}</th>`;
            for (let j = sc; j <= ec; j++) {
                tableHTML += `<td>${i * j}</td>`;
            }
            tableHTML += "</tr>";
        }
        tableHTML += "</tbody></table>";
        return tableHTML;
    }

    function updatePreviewTable() {
        const startCol = parseInt($("#startCol").val());
        const endCol = parseInt($("#endCol").val());
        const startRow = parseInt($("#startRow").val());
        const endRow = parseInt($("#endRow").val());

        // Check for NaN after parsing
        if (isNaN(startCol) || isNaN(endCol) || isNaN(startRow) || isNaN(endRow)) return;
        
        const tableHTML = generateTableHTML(startCol, endCol, startRow, endRow);
        
        // Update the table directly inside the preview container
        $("#resultTable").html($(tableHTML).html());
    }

    function saveTableToNewTab() {
        const startCol = parseInt($("#startCol").val());
        const endCol = parseInt($("#endCol").val());
        const startRow = parseInt($("#startRow").val());
        const endRow = parseInt($("#endRow").val());

        // The form submitHandler guarantees valid inputs here.
        const tabLabel = `${startCol},${endCol} x ${startRow},${endRow}`;
        const newTabId = `tab-${tabCounter++}`;
        const tableHTML = generateTableHTML(startCol, endCol, startRow, endRow);
        
        // Content for the new tab panel (Includes the delete checkbox and the table inside a container)
        const checkbox = `<input type="checkbox" class="delete-checkbox" id="check-${newTabId}">`;
        const $content = $(`<div id="${newTabId}" class="ui-tabs-panel tab-panel-content">
            ${checkbox}
            <label for="check-${newTabId}">Delete Table</label>
            <div class="table-container">${tableHTML}</div>
        </div>`);
        
        addTab(newTabId, tabLabel, $content);
    }
    
    // Function to add a new tab
    const addTab = function (id, labelText, $content) {
        const tabList = $("#tabs-list");
        const tabsContent = $("#tabs-content");

        // 1. Create the label link (with delete button)
        const $li = $(`<li><a href="#${id}">${labelText}</a></li>`);
        $li.append('<span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span>');
        tabList.append($li);

        // 2. Append the content div
        tabsContent.append($content);

        // 3. Refresh the tabs widget to recognize the new tab
        $tabs.tabs("refresh");

        // 4. Set the new tab as active
        $tabs.tabs("option", "active", tabList.children().length - 1);

        // Show the delete multiple tables button
        $("#deleteSelectedTabs").show();
    };

    // Tab deletion handler (individual tab)
    $("#tabs-list").on("click", "span.ui-icon-close", function () {
        const $li = $(this).closest("li");
        const panelId = $li.find("a").attr("href");
        
        $li.remove();
        $(panelId).remove();
        
        $tabs.tabs("refresh");
        
        // Check if all tabs are deleted
        if ($("#tabs-list li").length === 0) {
            $("#deleteSelectedTabs").hide();
        }
    });
    
    // Tab deletion handler (multiple tabs)
    $("#deleteSelectedTabs").on("click", function() {
        // Find all tabs with checked delete-checkboxes
        $("#tabs-content input[type='checkbox']:checked").each(function() {
            const panelId = "#" + $(this).closest(".ui-tabs-panel").attr("id");
            const $li = $(`#tabs-list li:has(a[href='${panelId}'])`);
            
            $li.remove();
            $(panelId).remove();
        });
        
        $tabs.tabs("refresh");
        
        // Hide delete all button if no tabs are left
        if ($("#tabs-list li").length === 0) {
            $("#deleteSelectedTabs").hide();
        }
    });
    
    // Set initial values for sliders based on input fields (uses default values from HTML)
    inputIds.forEach(id => $(`#${id}-slider`).trigger("create"));
    
    // Generate the initial dynamic preview table
    checkValidationAndUpdatePreview();
});
