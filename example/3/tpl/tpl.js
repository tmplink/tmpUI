app.ready(()=>{
    //without params
    let html1 = app.tpl('tpl_no_array');
    document.querySelector('#no_array').innerHTML = html1;

    //with params
    let params = [];
    for(let i =0;i <= 10;i++){
        params.push(randomString(8));
    }

    let html2 = app.tpl('tpl_with_object', params);
    document.querySelector('#with_object').innerHTML = html2;
});