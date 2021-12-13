function gotoPage1() {
    document.getElementById('index_title').innerHTML = app.languageData.index_page1_title;
    document.getElementById('index_action_content').style.display = 'block';
}
function gotoPage2() {
    document.getElementById('index_title').innerHTML = app.languageData.index_page2_title;
    document.getElementById('index_action_content').style.display = 'none';
}