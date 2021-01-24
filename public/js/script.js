function datePrint(date) {
    return date.toLocaleDateString('en-US',  {year: 'numeric', month: '2-digit', day: '2-digit' })
}

$(document).ready(() => {
    $("input[type=file]").on('change', function (){
        if (this.files[0].size > 1048576) {
            alert("file too large");
            this.value = "";
        }
    })
})