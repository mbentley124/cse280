function choose_a_service() {
    //set up UI
    if ($("#directions_tab").is(":visible")) {
        $("#directions_tab").toggle();
        return
    }
    $("#directions_tab").empty();
    // $("#directions_choice").show();
    $("#directions_instructions").toggle();

    $("#directions_instructions").html(
        `<p>Choose a service:</p>
        <button id="lehigh" type="button" style="color: black;" onclick="get_directions('lehigh')">Lehigh</button>
        <button id="lanta" type="button" style="color: black;" onclick="get_directions('lanta')">LANTA</button>`
    );
}